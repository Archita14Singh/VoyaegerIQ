from project.app.services.foundry_client import foundry_client
from project.app.models.requests import TravelPlanRequest
from project.app.models.responses import TravelPlanResponse

class PlannerService:
    """
    Orchestration service layer for constructing travel itineraries and
    organizing guidelines utilizing foundational logic from the AI client.
    """

    @staticmethod
    async def invoke_planner(request: TravelPlanRequest) -> TravelPlanResponse:
        itinerary, food, transit, tips, citations = await foundry_client.generate_travel_plan(
            country=request.country,
            city=request.city,
            duration=request.duration_days,
            budget=request.budget,
            purpose=request.purpose_of_visit,
            food_pref=request.food_preferences
        )
        
        return TravelPlanResponse(
            itinerary=itinerary,
            food_recommendations=food,
            transportation_recommendations=transit,
            travel_tips=tips,
            citations=citations
        )

planner_service = PlannerService()
