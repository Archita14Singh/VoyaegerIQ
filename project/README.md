# VoyagerIQ - Enterprise AI Travel Assistant Backend Service

VoyagerIQ is a premium, high-availability, async **FastAPI** backend designed to power conversational, visual, and geographic travel workflows for enterprise travelers. The system connects seamlessly to the **Azure AI Foundry Agent Service** and implements a durable **SQLite** database with **SQLAlchemy 2.0 (asyncio + aiosqlite)** to manage business and personal expense accounts.

---

## 🛠 Tech Stack & Architecture

- **Backend Framework:** FastAPI (Asynchronous lifecycle & CORS)
- **AI Agent Host:** Azure AI Foundry Agent Service (supports GPT-4, Azure AI Search Knowledge Base, Web Search Grounding integration)
- **Database Layer:** SQLAlchemy 2.0 ORM (Async Engine) with SQLite/aiosqlite
- **Object Schema Mapping:** Pydantic v2 validation models
- **Execution Scripting:** Uvicorn Async HTTP server pool

---

## 📂 Project Structure

```text
project/
├── app/
│   ├── __init__.py
│   ├── main.py              # Application Entry / Life cycle, Routers, Middlewares
│   ├── config.py            # Unified environment configurations
│   ├── dependencies.py      # Dependency injection (e.g., SQLite DB async session)
│
│   ├── routes/              # Modular Router Controller Endpoints
│   │   ├── chat.py          # POST /chat
│   │   ├── image.py         # POST /image-chat
│   │   ├── location.py      # POST /location-chat
│   │   ├── planner.py       # POST /travel-plan
│   │   └── expenses.py      # POST /expense/add | GET /expense/list | GET /expense/summary
│
│   ├── services/            # Custom Business Domain Service layers
│   │   ├── foundry_client.py# Dedicated Azure AI Foundry SDK adapter client
│   │   ├── planner_service.py # Trip planning coordinator
│   │   └── expense_service.py # Transaction processing rules
│
│   ├── models/              # Pydantic Schemas / Objects
│   │   ├── requests.py      # Request schemas
│   │   └── responses.py     # Clean structured JSON response schemas
│
│   └── database/
│       └── sqlite_db.py     # SQLAlchemy models & DB connection setup
│
├── requirements.txt         # Package dependency installations
├── .env.example             # Configuration settings template
└── README.md                # System deployment and developer guides
```

---

## 🚀 Setting Up the Application

### 1. Pre-requisites
Ensure you have Python 3.10+ installed on your workspace server.

### 2. Install Dependencies
Run the install script to fetch required bindings:
```bash
pip install -r requirements.txt
```

### 3. Environment Parameters Setup
Duplicate `.env.example` as `.env` and configure accordingly:
```bash
cp .env.example .env
```
Inside `.env` update values:
```env
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Azure AI Foundry Client Configurations
FOUNDRY_PROJECT_ENDPOINT=https://<workspace-name>.<region>.projects.azure.ai
FOUNDRY_AGENT_ID=your-agent-deployment-id
FOUNDRY_API_KEY=your-secret-key-string

DATABASE_URL=sqlite+aiosqlite:///./voyageriq_mvp.db
```

### 4. Run Development Server
To launch the active uvicorn server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The API Swagger documentation is then hosted live at `http://localhost:8000/docs`.

---

## 🧪 Testing & Verifying Endpoints (cURL API Guide)

### 💬 1. General AI Assitant Chat
- **Endpoint:** `POST /chat`
- **Request:**
  ```bash
  curl -X 'POST' \
    'http://localhost:8000/chat' \
    -H 'Content-Type: application/json' \
    -d '{
    "message": "I am travelling to Singapore for 5 days. What corporate hotels are pre-approved?",
    "session_id": "session-1234"
  }'
  ```

---

### 📷 2. Vision Multi-Modal Image Chat
- **Endpoint:** `POST /image-chat`
- **Request:**
  ```bash
  curl -X 'POST' \
    'http://localhost:8000/image-chat' \
    -H 'Content-Type: application/json' \
    -d '{
    "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "mime_type": "image/png",
    "message": "Verify if the date on this receipt matches the corporate travel schedule window."
  }'
  ```

---

### 📍 3. Location Grounded Concierge
- **Endpoint:** `POST /location-chat`
- **Request:**
  ```bash
  curl -X 'POST' \
    'http://localhost:8000/location-chat' \
    -H 'Content-Type: application/json' \
    -d '{
    "latitude": 1.2833,
    "longitude": 103.8519,
    "message": "Select vegetarian restaurants within 200m walking radius."
  }'
  ```

---

### 📅 4. Corporate Travel Planner
- **Endpoint:** `POST /travel-plan`
- **Request:**
  ```bash
  curl -X 'POST' \
    'http://localhost:8000/travel-plan' \
    -H 'Content-Type: application/json' \
    -d '{
    "country": "UK",
    "city": "London",
    "duration_days": 3,
    "budget": "Premium",
    "purpose_of_visit": "EMEA Board Presentation",
    "food_preferences": "Vegetarian"
  }'
  ```

---

### 💳 5. Expense Management SQL Ledger

#### A. Record New Expense (POST `/expense/add`)
```bash
curl -X 'POST' \
  'http://localhost:8000/expense/add' \
  -H 'Content-Type: application/json' \
  -d '{
  "vendor": "Plateau Canary Wharf Ltd",
  "amount": 182.50,
  "currency": "GBP",
  "category": "Food",
  "type": "Business",
  "date": "2026-06-12",
  "description": "Board coordination planning dinner with local director."
}'
```

#### B. Fetch ledger index list (GET `/expense/list`)
```bash
curl -X 'GET' 'http://localhost:8000/expense/list'
```

#### C. Request total balances and math calculation (GET `/expense/summary`)
```bash
curl -X 'GET' 'http://localhost:8000/expense/summary'
```

---

## 🔗 Azure AI Foundry Agent SDK Integration Note

The initialization hook inside `app/services/foundry_client.py` utilizes the official `azure-ai-projects` package. When deploying to production:

1. Enable your Azure Identity framework configurations either via Entra User Assigned Identities or traditional `FOUNDRY_API_KEY` credential values.
2. Complete the placeholders marked with `# TODO: CRITICAL AZURE ...` Comments.
3. The SDK logic handles thread persistence automatically:
   - Call `client.agents.create_thread()` on session starts.
   - Inject text and vision parameters with `client.agents.create_message()`.
   - Resolve queries asynchronously through `client.agents.create_run_and_poll()`.
