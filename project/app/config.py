import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load local .env variables
load_dotenv()

class AppSettings(BaseModel):
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t", "yes")
    
    # Azure AI Foundry Configuration parameters
    FOUNDRY_PROJECT_ENDPOINT: str = os.getenv("FOUNDRY_PROJECT_ENDPOINT", "")
    FOUNDRY_AGENT_ID: str = os.getenv("FOUNDRY_AGENT_ID", "travelai")
    FOUNDRY_AGENT_NAME: str = os.getenv("FOUNDRY_AGENT_NAME", "travelai")
    FOUNDRY_AGENT_VERSION: str = os.getenv("FOUNDRY_AGENT_VERSION", "")
    FOUNDRY_ISOLATION_KEY: str = os.getenv("FOUNDRY_ISOLATION_KEY", "my-isolation-key")
    FOUNDRY_API_KEY: str = os.getenv("FOUNDRY_API_KEY", "")
    
    # SQLite local DB string
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./voyageriq_mvp.db")

settings = AppSettings()
