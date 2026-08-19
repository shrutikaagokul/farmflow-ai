# agents/actionflow/__init__.py
# ActionFlow — Orchestration & Decision Agent
# Fourth and final agent in the FarmFlow pipeline: SENSE → PREDICT → MATCH → ACT
#
# Usage:
#   from agents.actionflow.logic import run_actionflow
#   result = run_actionflow(farmsense_output, cropguard_output, marketmind_output)

from agents.actionflow.logic import run_actionflow  # noqa: F401

__all__ = ["run_actionflow"]
