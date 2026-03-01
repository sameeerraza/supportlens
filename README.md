# SupportLens

A lightweight observability platform for a customer support chatbot — built with FastAPI, Next.js, SQLite, and Google Gemini.

## Live Demo

- **Dashboard**: https://supportlens-ox43u3ybz-sameer-razas-projects.vercel.app

## Architecture

```
supportlens/
├── backend/          # FastAPI + SQLite + Gemini
│   ├── main.py       # API routes & startup
│   ├── models.py     # SQLAlchemy ORM models
│   ├── schemas.py    # Pydantic request/response schemas
│   ├── llm.py        # Gemini integration (chat + classification)
│   ├── seed.py       # 22 pre-classified seed traces
│   └── requirements.txt
├── frontend/         # Next.js + Tailwind
│   └── app/
│       ├── page.tsx          # Observability dashboard
│       ├── chatbot/page.tsx  # Support chatbot UI
│       └── components/       # Navbar, CategoryBadge
└── README.md
```

## Setup (2 terminals)

### 1. Backend

```bash
cd backend

# Create virtualenv
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Gemini API key
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here
# Get a free key at: https://aistudio.google.com/app/apikey

# Start server
uvicorn main:app --reload --port 8000
```

The backend starts at http://localhost:8000 and automatically:

- Creates the SQLite database
- Seeds 22 pre-classified traces across all 5 categories

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at http://localhost:3000

## Usage

- **Dashboard** → http://localhost:3000 — View all traces, analytics, filter by category
- **Chatbot** → http://localhost:3000/chatbot — Chat with the support bot

## API Endpoints

| Method | Endpoint                   | Description                               |
| ------ | -------------------------- | ----------------------------------------- |
| POST   | `/chat`                    | Generate response → classify → save trace |
| POST   | `/traces`                  | Create trace → classify → save            |
| GET    | `/traces?category=Billing` | Get traces (optional filter)              |
| GET    | `/analytics`               | Aggregate stats                           |
| GET    | `/health`                  | Health check                              |

## Classification Prompt Design

The classification uses a carefully crafted prompt with:

- **Clear category definitions** with disambiguating examples
- **Explicit tie-breaking rules** (e.g., if Billing + Cancellation overlap → Cancellation wins)
- **Strict output format**: returns exactly one category name, nothing else
- **Fallback parsing**: if LLM returns extra text, keyword matching extracts the category

## Stack

- **Backend**: FastAPI · SQLAlchemy · SQLite · Pydantic v2
- **Frontend**: Next.js 14 (App Router) · TypeScript · Tailwind CSS
- **LLM**: Google Gemini 3 Flash Preview (free tier)
