from fastapi import APIRouter, HTTPException, status
from project.app.models.requests import ImageChatRequest
from project.app.models.responses import ImageChatResponse
from project.app.services.foundry_client import foundry_client

router = APIRouter()

@router.post("/image-chat", response_model=ImageChatResponse)
async def image_chat_endpoint(request: ImageChatRequest):
    """
    Accepts Base64 image payload strings with prompt questions and utilizes 
    Azure AI Foundry Multi-modal agents for visual translation.
    """
    try:
        if not request.image_base64.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Source image base64 value cannot be empty."
            )
            
        response_content, citations = await foundry_client.send_image_message(
            image_base64=request.image_base64,
            mime_type=request.mime_type or "image/jpeg",
            message=request.message or "Review this travel document or sight."
        )
        
        return ImageChatResponse(
            response=response_content,
            citations=citations
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute Multi-modal Vision assessment: {str(e)}"
        )
