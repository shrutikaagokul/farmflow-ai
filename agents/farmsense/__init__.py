# agents/farmsense/__init__.py
# FarmSense — Environmental Intelligence Agent
# First agent in the FarmFlow pipeline.
#
# Usage:
#   from agents.farmsense.agent import analyze
#   result = analyze(telemetry_dict)

from agents.farmsense.agent import analyze  # noqa: F401

__all__ = ["analyze"]
