from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

VALID_CATEGORIES = ["Billing", "Refund", "Account Access", "Cancellation", "General Inquiry"]

class TraceCreate(BaseModel):
    user_message: str
    bot_response: str
    response_time_ms: int

class TraceResponse(BaseModel):
    id: str
    user_message: str
    bot_response: str
    category: str
    timestamp: datetime
    response_time_ms: int

    class Config:
        from_attributes = True

class CategoryStat(BaseModel):
    category: str
    count: int
    percentage: float

class AnalyticsResponse(BaseModel):
    total_traces: int
    average_response_time_ms: float
    category_breakdown: List[CategoryStat]


class ChatRequest(BaseModel):
    user_message: str