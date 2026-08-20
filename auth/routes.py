"""
FarmFlow AI — Auth API Routes
================================

FastAPI router for OTP authentication, session management,
and demo login endpoints.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from auth.models import OTPRequest, OTPResponse, VerifyRequest, VerifyResponse
from auth.otp import request_otp, verify_otp
from auth.sessions import create_session, get_session, destroy_session

router = APIRouter()

# ---------------------------------------------------------------------------
# Demo user profiles
# ---------------------------------------------------------------------------
DEMO_USERS = {
    "fpo": {
        "mobile": "0000000001",
        "role": "fpo",
        "name": "Demo FPO",
        "organization": "Thanjavur Paddy Farmers Collective",
        "location": "Thanjavur, Tamil Nadu",
        "is_demo": True,
    },
    "buyer": {
        "mobile": "0000000002",
        "role": "buyer",
        "name": "Demo Buyer",
        "organization": "Delta Agri Markets",
        "location": "Chennai, Tamil Nadu",
        "is_demo": True,
    },
}


# ---------------------------------------------------------------------------
# Helper: extract token from Authorization header
# ---------------------------------------------------------------------------
def _extract_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization


import os

# ---------------------------------------------------------------------------
# POST /api/auth/request-otp
# ---------------------------------------------------------------------------
@router.post("/request-otp", response_model=OTPResponse)
def api_request_otp(body: OTPRequest):
    """Generate and send an OTP to the given mobile number."""
    masked_mobile = '*' * (len(body.mobile) - 2) + body.mobile[-2:] if len(body.mobile) >= 2 else body.mobile
    print(f"\n[FARMFLOW API] Received /api/auth/request-otp — Mobile: {masked_mobile}, Role: {body.role}", flush=True)

    success, message, expires = request_otp(body.mobile, body.role)
    if not success:
        raise HTTPException(status_code=429, detail=message)

    return OTPResponse(
        success=True,
        message=message,
        expires_in_seconds=expires,
    )


# ---------------------------------------------------------------------------
# POST /api/auth/verify-otp
# ---------------------------------------------------------------------------
@router.post("/verify-otp", response_model=VerifyResponse)
def api_verify_otp(body: VerifyRequest):
    """Verify an OTP and create an authenticated session."""
    success, message = verify_otp(body.mobile, body.otp, body.role)
    if not success:
        raise HTTPException(status_code=401, detail=message)

    # Create session
    user_data = {
        "mobile": body.mobile,
        "role": body.role,
        "name": f"FPO User" if body.role == "fpo" else "Buyer User",
        "organization": None,
        "location": None,
        "is_demo": False,
    }
    token = create_session(user_data)

    return VerifyResponse(
        success=True,
        message="Authenticated successfully",
        token=token,
        user=user_data,
    )


# ---------------------------------------------------------------------------
# POST /api/auth/demo-login
# ---------------------------------------------------------------------------
@router.post("/demo-login")
def api_demo_login(body: dict):
    """
    Instant demo login without OTP.
    Accepts: { "role": "fpo" | "buyer" }
    """
    role = body.get("role")
    if role not in DEMO_USERS:
        raise HTTPException(status_code=400, detail="Invalid demo role. Use 'fpo' or 'buyer'.")

    user_data = DEMO_USERS[role].copy()
    token = create_session(user_data)

    return {
        "success": True,
        "message": f"Demo {role.upper()} login successful",
        "token": token,
        "user": user_data,
    }


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------
@router.get("/me")
def api_me(authorization: Optional[str] = Header(None)):
    """Return the current authenticated user's profile."""
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = get_session(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    return {"success": True, "user": user}


# ---------------------------------------------------------------------------
# POST /api/auth/logout
# ---------------------------------------------------------------------------
@router.post("/logout")
def api_logout(authorization: Optional[str] = Header(None)):
    """Invalidate the current session."""
    token = _extract_token(authorization)
    if token:
        destroy_session(token)
    return {"success": True, "message": "Logged out successfully"}
