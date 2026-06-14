from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from project.app.database.sqlite_db import ExpenseModel
from project.app.models.requests import ExpenseAddRequest
from project.app.models.responses import ExpenseResponse, ExpenseSummaryResponse

class ExpenseService:
    """
    Subsystem business rules coordinator for writing, loading, and
    aggregating travel financial expenses in the internal SQLite ledger.
    """

    @staticmethod
    async def add_expense(session: AsyncSession, request: ExpenseAddRequest) -> ExpenseResponse:
        # Business expenses default to Eligible status, personal is N/A
        status_assignment = "Eligible" if request.type == "Business" else "N/A"
        
        db_expense = ExpenseModel(
            vendor=request.vendor,
            amount=request.amount,
            currency=request.currency,
            category=request.category,
            type=request.type,
            date=request.date,
            description=request.description,
            status=status_assignment
        )
        
        session.add(db_expense)
        await session.flush()  # Populates autoincremented id
        
        return ExpenseResponse(
            id=db_expense.id,
            vendor=db_expense.vendor,
            amount=db_expense.amount,
            currency=db_expense.currency,
            category=db_expense.category,
            type=db_expense.type,
            date=db_expense.date,
            description=db_expense.description,
            status=db_expense.status
        )

    @staticmethod
    async def list_expenses(session: AsyncSession) -> List[ExpenseResponse]:
        query = select(ExpenseModel).order_by(ExpenseModel.id.desc())
        raw_result = await session.execute(query)
        records = raw_result.scalars().all()
        
        return [
            ExpenseResponse(
                id=record.id,
                vendor=record.vendor,
                amount=record.amount,
                currency=record.currency,
                category=record.category,
                type=record.type,
                date=record.date,
                description=record.description,
                status=record.status
            )
            for record in records
        ]

    @staticmethod
    async def get_ledger_summary(session: AsyncSession) -> ExpenseSummaryResponse:
        # Extract business aggregate sums
        biz_select = select(func.sum(ExpenseModel.amount)).where(ExpenseModel.type == "Business")
        biz_res = await session.execute(biz_select)
        total_biz = biz_res.scalar() or 0.0

        # Extract personal aggregate sums
        pers_select = select(func.sum(ExpenseModel.amount)).where(ExpenseModel.type == "Personal")
        pers_res = await session.execute(pers_select)
        total_pers = pers_res.scalar() or 0.0

        # Count count of active reimbursable files
        count_select = select(func.count(ExpenseModel.id)).where(ExpenseModel.type == "Business")
        count_res = await session.execute(count_select)
        count_reimbursable = count_res.scalar() or 0

        # Group and summarize total expenditures by distinct category names
        cat_select = select(ExpenseModel.category, func.sum(ExpenseModel.amount)).group_by(ExpenseModel.category)
        cat_res = await session.execute(cat_select)
        by_category = {str(row[0]): float(row[1]) for row in cat_res.all()}

        return ExpenseSummaryResponse(
            total_business=float(total_biz),
            total_personal=float(total_pers),
            grand_total=float(total_biz + total_pers),
            by_category=by_category,
            count_reimbursable=int(count_reimbursable)
        )

expense_service = ExpenseService()
