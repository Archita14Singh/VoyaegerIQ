import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from project.app.config import settings
from project.app.database.sqlite_db import init_db

# Include all required controller routers
from project.app.routes.chat import router as chat_router
from project.app.routes.image import router as vision_router
from project.app.routes.location import router as location_router
from project.app.routes.planner import router as planner_router
from project.app.routes.expenses import router as expense_router

# Configure active log outputs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VoyagerIQ.Main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Standard state lifecycle boundaries for the VoyagerIQ application.
    Executes database structure verification on startup.
    """
    logger.info("Initializing SQLite transaction engine systems...")
    await init_db()
    logger.info("Tables created and database successfully primed.")
    yield
    logger.info("Shutting down VoyagerIQ API Services...")

app = FastAPI(
    title="VoyagerIQ Backend API Engine",
    description="Enterprise AI Agent Powered Travel Concierge with SQL Ledger Capabilities",
    version="1.0.0",
    lifespan=lifespan,
    debug=settings.DEBUG
)

# Apply permissive, structured Cross-Origin Resource Sharing rules
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind routers to root level as per specification requirements
app.include_router(chat_router, tags=["Conversational AI Chat"])
app.include_router(vision_router, tags=["Vision Document Scanner"])
app.include_router(location_router, tags=["Geospatial AI Grounding"])
app.include_router(planner_router, tags=["Travel Logistics Itinerary Generator"])
app.include_router(expense_router, tags=["Financial Expense SQL Ledger Tracking"])

@app.get("/", tags=["Diagnostic Infrastructure Metadata"])
async def root_index():
    """
    Index information block for testing server health status and 
    environment profiles dynamically.
    """
    return {
        "service": "VoyagerIQ Enterprise Travel Concierge Engine",
        "status": "Online",
        "version": "1.0.0",
        "azure_foundary": {
            "endpoint_configured": bool(settings.FOUNDRY_PROJECT_ENDPOINT),
            "agent_id_configured": bool(settings.FOUNDRY_AGENT_ID),
        }
    }
