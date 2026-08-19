"""
FarmFlow AI — Auth Pydantic Models
====================================
Request/response models for the OTP authentication flow.
"""

from pydantic import BaseModel, Field
from typing import Optional


class OTPRequest(BaseModel):
    """Request to generate and send an OTP."""
    mobile: str = Field(..., min_length=10, max_length=15, description="Mobile number")
    role: str = Field(..., pattern="^(fpo|buyer)$", description="User role: 'fpo' or 'buyer'")


class OTPResponse(BaseModel):
    """Response after OTP is generated."""
    success: bool
    message: str
    expires_in_seconds: int = 300


class VerifyRequest(BaseModel):
    """Request to verify an OTP."""
    mobile: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=4, max_length=6)
    role: str = Field(..., pattern="^(fpo|buyer)$")


class VerifyResponse(BaseModel):
    """Response after successful OTP verification."""
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None


class UserProfile(BaseModel):
    """Authenticated user profile."""
    mobile: str
    role: str
    name: str
    organization: Optional[str] = None
    location: Optional[str] = None
    is_demo: bool = False
