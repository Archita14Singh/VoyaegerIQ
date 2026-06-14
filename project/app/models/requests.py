from pydantic import BaseModel, Field
from typing import Optional, Literal

class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="Message payload to send to the AI travel assistant.")
    session_id: Optional[str] = Field(None, description="Optional conversation session ID to persist context.")


class ImageChatRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded string format of the target image.")
    mime_type: Optional[str] = Field("image/jpeg", description="MIME type of the uploaded image.")
    message: Optional[str] = Field("Analyze this image for travel recommendations or details", description="Associated query or message.")


class LocationChatRequest(BaseModel):
    latitude: float = Field(..., description="User GPS latitude.")
    longitude: float = Field(..., description="User GPS longitude.")
    message: Optional[str] = Field("What is nearby my position?", description="Optional custom questions about the location.")


class TravelPlanRequest(BaseModel):
    country: str = Field(..., description="Destination country.")
    city: str = Field(..., description="Destination city name.")
    duration_days: int = Field(..., ge=1, description="Length of the trip in days.")
    budget: str = Field(..., description="Level of budget: Premium, Moderate, Economy.")
    purpose_of_visit: str = Field(..., description="Purpose e.g., APAC Q3 Summit, EMEA Roadshow, Leisure.")
    food_preferences: Literal["Vegetarian", "Vegan", "Eggetarian", "Non-Vegetarian"] = Field(
        "Non-Vegetarian", 
        description="User food dietary preference"
    )


class ExpenseAddRequest(BaseModel):
    vendor: str = Field(..., min_length=1, description="The supplier or merchant name.")
    amount: float = Field(..., gt=0, description="Cost amount.")
    currency: str = Field("USD", min_length=3, max_length=10, description="Currency ISO or abbreviation.")
    category: Literal[
        "Food", "Hotel", "Flight", "Transport", "Office Related", "Shopping", "Entertainment", "Personal Food", "Personal Travel", "Other"
    ] = Field(..., description="Category allocation for ledger processing.")
    type: Literal["Business", "Personal"] = Field(..., description="Division between reimbursable business and individual out-of-pocket costs.")
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Standard YYYY-MM-DD date representation.")
    description: Optional[str] = Field(None, description="Detailed explanatory comments.")
