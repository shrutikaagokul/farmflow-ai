"""
FarmFlow AI — Session Management
==================================

Lightweight in-memory session store for the hackathon prototype.
Maps session tokens to authenticated user profiles.
"""

import secrets
from typing import Optional

# ---------------------------------------------------------------------------
# In-memory session store: { token: UserProfile dict }
# ---------------------------------------------------------------------------
_sessions: dict = {}


def create_session(user_data: dict) -> str:
    """
    Create a new session for an authenticated user.

    Args:
        user_data: Dict with keys: mobile, role, name, organization, location, is_demo

    Returns:
        A secure session token string.
    """
    token = secrets.token_urlsafe(32)
    _sessions[token] = {
        "mobile": user_data.get("mobile", ""),
        "role": user_data.get("role", ""),
        "name": user_data.get("name", ""),
        "organization": user_data.get("organization"),
        "location": user_data.get("location"),
        "is_demo": user_data.get("is_demo", False),
    }
    return token


def get_session(token: str) -> Optional[dict]:
    """Retrieve user data for a session token, or None if invalid."""
    return _sessions.get(token)


def destroy_session(token: str) -> bool:
    """Remove a session. Returns True if the session existed."""
    if token in _sessions:
        del _sessions[token]
        return True
    return False


def active_session_count() -> int:
    """Return the number of active sessions."""
    return len(_sessions)
