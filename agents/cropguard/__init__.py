"""
CropGuard package init.
Exposes the predict function and key schemas at the package level.
"""

from .model import CropGuardOutput, CropGuardRequest, FarmInput, FarmSenseInput
from .predictor import predict

__all__ = [
    "predict",
    "FarmInput",
    "FarmSenseInput",
    "CropGuardRequest",
    "CropGuardOutput",
]
