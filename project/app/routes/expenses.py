from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from project.app.dependencies import get_db
from project.app.models.requests import ExpenseAddRequest
from project.app.models.responses import ExpenseResponse, ExpenseSummaryResponse
from project.app.services.expense_service import expense_service

router = APIRouter()

@router.post("/expense/add", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def add_expense_endpoint(
    request: ExpenseAddRequest, 
    session: AsyncSession = Depends(get_db)
):
    """
    Inserts a newly scanned or manually keyed corporate travel budget 
    expense element into the SQLite transaction tables.
    """
    try:
        return await expense_service.add_expense(session, request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record new financial ledger expense: {str(e)}"
        )


@router.get("/expense/list", response_model=List[ExpenseResponse])
async def list_expenses_endpoint(session: AsyncSession = Depends(get_db)):
    """
    Exposes the reverse chronological record lists of all business and 
    personal expenses captured in active transactions.
    """
    try:
        return await expense_service.list_expenses(session)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch travel ledger records: {str(e)}"
        )


@router.get("/expense/summary", response_model=ExpenseSummaryResponse)
async def get_summary_endpoint(session: AsyncSession = Depends(get_db)):
    """
    Calculates aggregate expense stats, grouping values into total business, 
    total personal, gross total, and subtotals per categories.
    """
    try:
        return await expense_service.get_ledger_summary(session)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute ledger aggregates: {str(e)}"
        )
