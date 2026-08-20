"""
FarmFlow AI — OTP Generation & Verification
=============================================

Secure random OTP generation with expiry, attempt limiting,
and resend cooldown.  In-memory store for hackathon prototype.

Provider abstraction so a real SMS gateway can be plugged in later.
"""

import os
import secrets
import sys
import time
from typing import Optional, Tuple

# ---------------------------------------------------------------------------
# Configuration (from environment or defaults)
# ---------------------------------------------------------------------------
OTP_LENGTH = 6
OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", "300"))  # 5 minutes
MAX_VERIFY_ATTEMPTS = 5
RESEND_COOLDOWN_SECONDS = 30

# ---------------------------------------------------------------------------
# In-memory OTP store: { mobile: { otp, created_at, attempts, role } }
# ---------------------------------------------------------------------------
_otp_store: dict = {}


def generate_otp() -> str:
    """Generate a secure random numeric OTP."""
    # Use secrets for cryptographic randomness
    return "".join(str(secrets.randbelow(10)) for _ in range(OTP_LENGTH))


def request_otp(mobile: str, role: str) -> Tuple[bool, str, int]:
    """
    Generate an OTP for the given mobile number.

    Returns:
        (success, message, expires_in_seconds)
    """
    now = time.time()
    existing = _otp_store.get(mobile)

    # Resend cooldown
    if existing and (now - existing["created_at"]) < RESEND_COOLDOWN_SECONDS:
        remaining = int(RESEND_COOLDOWN_SECONDS - (now - existing["created_at"]))
        return False, f"Please wait {remaining}s before requesting a new OTP", 0

    otp = generate_otp()
    _otp_store[mobile] = {
        "otp": otp,
        "created_at": now,
        "attempts": 0,
        "role": role,
    }

    # Log to server console if demo mode is enabled
    _send_otp(mobile, otp)

    return True, "OTP generated successfully", OTP_EXPIRY_SECONDS


def verify_otp(mobile: str, otp: str, role: str) -> Tuple[bool, str]:
    """
    Verify the OTP for a mobile number. Single-use: removes entry on success.

    Returns:
        (success, message)
    """
    record = _otp_store.get(mobile)

    if not record:
        return False, "No OTP requested for this number"

    # Check expiry
    if (time.time() - record["created_at"]) > OTP_EXPIRY_SECONDS:
        del _otp_store[mobile]
        return False, "OTP has expired. Please request a new one"

    # Check max attempts
    if record["attempts"] >= MAX_VERIFY_ATTEMPTS:
        del _otp_store[mobile]
        return False, "Maximum verification attempts exceeded. Please request a new OTP"

    record["attempts"] += 1

    # Check role match
    if record["role"] != role:
        return False, "Role mismatch"

    # Check OTP match (constant-time comparison)
    if not secrets.compare_digest(record["otp"], otp):
        remaining = MAX_VERIFY_ATTEMPTS - record["attempts"]
        return False, f"Invalid OTP. {remaining} attempt(s) remaining"

    # Success — clean up immediately so OTP is single-use
    del _otp_store[mobile]
    return True, "OTP verified successfully"


def clear_expired() -> int:
    """Remove expired OTP entries. Returns count of entries removed."""
    now = time.time()
    expired = [
        m for m, r in _otp_store.items()
        if (now - r["created_at"]) > OTP_EXPIRY_SECONDS
    ]
    for m in expired:
        del _otp_store[m]
    return len(expired)


# ---------------------------------------------------------------------------
# SMS Provider Abstraction
# ---------------------------------------------------------------------------
def _send_otp(mobile: str, otp: str) -> None:
    """
    Send OTP via the configured SMS provider.

    For hackathon demo mode, this prints the OTP directly to sys.stdout with immediate flush.
    In production (FARMFLOW_DEMO_MODE=false), no OTP is printed.
    """
    is_demo_mode = os.getenv("FARMFLOW_DEMO_MODE", "true").lower() in ("true", "1", "yes")
    masked_mobile = '*' * (len(mobile) - 2) + mobile[-2:] if len(mobile) >= 2 else mobile

    if is_demo_mode:
        log_msg = (
            "\n==================================================\n"
            "[FARMFLOW AUTH] DEMO OTP GENERATED\n"
            f"Mobile: {masked_mobile}\n"
            f"OTP: {otp}\n"
            "Expires: 5 minutes\n"
            "==================================================\n"
        )
        print(log_msg, flush=True)
        sys.stdout.flush()
    else:
        log_msg = f"[FarmFlow AUTH] SMS payload prepared for Mobile: {masked_mobile}\n"
        print(log_msg, flush=True)
        sys.stdout.flush()
