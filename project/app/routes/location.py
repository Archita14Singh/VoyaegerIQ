from fastapi import APIRouter, HTTPException, status
from project.app.models.requests import LocationChatRequest
from project.app.models.responses import LocationChatResponse
from project.app.services.foundry_client import foundry_client

router = APIRouter()

@router.post("/location-chat", response_model=LocationChatResponse)
async def location_chat_endpoint(request: LocationChatRequest):
    """
    Submits latitude and longitude coordinates to Azure AI Agents, enabling 
    geospatial grounding and pulling surrounding attraction/dining details.
    """
    try:
        query_text = request.message if request.message else "Discover surroundings near current coordinates."
        
        response_content, citations = await foundry_client.send_location_message(
            latitude=request.latitude,
            longitude=request.longitude,
            message=query_text
        )
        
        return LocationChatResponse(
            response=response_content,
            citations=citations
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during coordinate grounding computations: {str(e)}"
        )
