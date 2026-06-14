from fastapi import APIRouter, HTTPException, status
from project.app.models.requests import ChatMessageRequest
from project.app.models.responses import ChatMessageResponse
from project.app.services.foundry_client import foundry_client

router = APIRouter()

@router.post("/chat", response_model=ChatMessageResponse)
async def chat_endpoint(request: ChatMessageRequest):
    """
    Relays text questions to the Azure AI Foundry thread configuration context,
    returning structured response descriptions combined with citations.
    """
    try:
        if not request.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User prompt message cannot be blank."
            )
            
        response_content, citations = await foundry_client.send_chat_message(
            message=request.message,
            session_id=request.session_id
        )
        
        return ChatMessageResponse(
            response=response_content,
            session_id=request.session_id,
            citations=citations
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile agent response structure: {str(e)}"
        )
