from fastapi import APIRouter, HTTPException, status
from project.app.models.requests import TravelPlanRequest
from project.app.models.responses import TravelPlanResponse
from project.app.services.planner_service import planner_service

router = APIRouter()

@router.post("/travel-plan", response_model=TravelPlanResponse)
async def travel_plan_endpoint(request: TravelPlanRequest):
    """
    Formulates a comprehensive, diet-specific international business trip 
    schedule from Azure AI Agent suggestions using the Planner Service.
    """
    try:
        if request.duration_days <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Duration of stay must represent 1 or more days."
            )
            
        return await planner_service.invoke_planner(request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while compiling your dynamic schedule: {str(e)}"
        )
