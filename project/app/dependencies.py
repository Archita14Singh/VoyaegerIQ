from sqlalchemy.ext.asyncio import AsyncSession
from project.app.database.sqlite_db import get_db_session

async def get_db() -> AsyncSession:
    """
    FastAPI dependency injection provider for retrieving the active 
    AsyncSession transaction context on a per-request basis.
    """
    async for session in get_db_session():
        yield session
