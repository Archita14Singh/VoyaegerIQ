from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float
from project.app.config import settings

class Base(DeclarativeBase):
    pass

class ExpenseModel(Base):
    __tablename__ = "expenses"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    vendor: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="USD")
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., Food, Hotel, Flight, Shopping
    type: Mapped[str] = mapped_column(String(20), nullable=False)      # "Business" or "Personal"
    date: Mapped[str] = mapped_column(String(10), nullable=False)      # YYYY-MM-DD
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="Eligible")

# Async SQLAlchemy Engine setup
engine = create_async_engine(settings.DATABASE_URL, echo=False)

# Session factory for handling requests
async_session_factory = async_sessionmaker(
    bind=engine, 
    expire_on_commit=False, 
    class_=AsyncSession
)

async def init_db():
    """Initializes tables in database."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db_session():
    """Yields active async session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
