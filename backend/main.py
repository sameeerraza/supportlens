from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime
import time

from models import Trace, get_db, create_tables, SessionLocal
from schemas import TraceCreate, TraceResponse, AnalyticsResponse, CategoryStat, ChatRequest
from llm import classify_trace, generate_chat_response
from seed import get_seed_data

app = FastAPI(title="SupportLens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_CATEGORIES = ["Billing", "Refund", "Account Access", "Cancellation", "General Inquiry"]


@app.on_event("startup")
def startup_event():
    create_tables()
    db = SessionLocal()
    try:
        count = db.query(Trace).count()
        if count == 0:
            seed_traces = get_seed_data()
            for t in seed_traces:
                db.add(Trace(**t))
            db.commit()
            print(f"Seeded {len(seed_traces)} traces.")
        else:
            print(f"Database already has {count} traces, skipping seed.")
    finally:
        db.close()


@app.post("/traces", response_model=TraceResponse)
async def create_trace(trace: TraceCreate, db: Session = Depends(get_db)):
    # Classify the trace using LLM
    try:
        category = await classify_trace(trace.user_message, trace.bot_response)
    except Exception as e:
        print(f"Classification error: {e}")
        category = "General Inquiry"

    db_trace = Trace(
        user_message=trace.user_message,
        bot_response=trace.bot_response,
        category=category,
        timestamp=datetime.utcnow(),
        response_time_ms=trace.response_time_ms,
    )
    db.add(db_trace)
    db.commit()
    db.refresh(db_trace)
    return db_trace


@app.get("/traces", response_model=List[TraceResponse])
def get_traces(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Trace)
    if category:
        if category not in VALID_CATEGORIES:
            raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {VALID_CATEGORIES}")
        query = query.filter(Trace.category == category)
    traces = query.order_by(Trace.timestamp.desc()).all()
    return traces


@app.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(Trace).count()

    if total == 0:
        return AnalyticsResponse(
            total_traces=0,
            average_response_time_ms=0.0,
            category_breakdown=[]
        )

    avg_response_time = db.query(func.avg(Trace.response_time_ms)).scalar() or 0.0

    category_counts = (
        db.query(Trace.category, func.count(Trace.id).label("count"))
        .group_by(Trace.category)
        .all()
    )

    # Ensure all 5 categories are present
    counts_map = {row.category: row.count for row in category_counts}
    breakdown = []
    for cat in VALID_CATEGORIES:
        count = counts_map.get(cat, 0)
        breakdown.append(CategoryStat(
            category=cat,
            count=count,
            percentage=round((count / total) * 100, 1) if total > 0 else 0.0
        ))

    return AnalyticsResponse(
        total_traces=total,
        average_response_time_ms=round(avg_response_time, 1),
        category_breakdown=breakdown
    )


@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Generate chatbot response and save trace in one call"""
    import time
    
    start = time.time()
    
    try:
        bot_response = await generate_chat_response(request.user_message)
    except Exception as e:
        print(f"Chat generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")
    
    response_time_ms = int((time.time() - start) * 1000)
    
    # Classify the trace
    try:
        category = await classify_trace(request.user_message, bot_response)
    except Exception as e:
        print(f"Classification error: {e}")
        category = "General Inquiry"
    
    # Save trace
    db_trace = Trace(
        user_message=request.user_message,
        bot_response=bot_response,
        category=category,
        timestamp=datetime.utcnow(),
        response_time_ms=response_time_ms,
    )
    db.add(db_trace)
    db.commit()
    db.refresh(db_trace)
    
    return db_trace


@app.get("/health")
def health():
    return {"status": "ok"}