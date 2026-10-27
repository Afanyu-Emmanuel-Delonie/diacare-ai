"""
FastAPI service that serves the trained risk model. Mirrors the input shape of
the Java RiskPredictionRequestDto so the Spring Boot backend can call it directly.

Run with: uvicorn app:app --host 0.0.0.0 --port 8000
"""

import json
from datetime import datetime
from typing import List, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

from train import (
    EMERGENCY_HYPER_THRESHOLD,
    FEATURE_COLUMNS,
    HYPER_THRESHOLD,
    HYPO_THRESHOLD,
    SEVERE_HYPO_THRESHOLD,
)

app = FastAPI(title="Diabetes Risk Prediction Service")

model = joblib.load("model/risk_model.joblib")
label_encoder = joblib.load("model/label_encoder.joblib")
with open("model/feature_columns.json") as f:
    feature_columns = json.load(f)


class RiskPredictionRequest(BaseModel):
    currentReading: float
    measuredAt: Optional[datetime] = None
    recentReadings: List[float] = []
    medicationAdherenceMissed: bool = False
    hba1cResult: Optional[float] = None


class RiskPredictionResponse(BaseModel):
    riskCategory: str
    triggeredSignals: List[str]
    confidence: float
    probabilities: dict


def build_signals(current_reading: float, recent_readings: List[float],
                   medication_adherence_missed: bool, hba1c_result: Optional[float]) -> List[str]:
    signals = []
    if current_reading < HYPO_THRESHOLD:
        signals.append("Possible hypoglycemia")
    if current_reading > HYPER_THRESHOLD:
        signals.append("Possible hyperglycemia")

    abnormal_count = sum(v < HYPO_THRESHOLD or v > HYPER_THRESHOLD for v in recent_readings)
    if abnormal_count >= 2:
        signals.append("Repeated abnormal readings")

    if medication_adherence_missed:
        signals.append("Missed medication risk")

    if hba1c_result is not None and hba1c_result >= 8.0:
        signals.append("Elevated HbA1c result")

    return signals


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=RiskPredictionResponse)
def predict(request: RiskPredictionRequest):
    recent = request.recentReadings or []
    recent_arr = np.array(recent) if recent else np.array([request.currentReading])

    hour_of_day = request.measuredAt.hour if request.measuredAt else 12
    is_night = 1 if (hour_of_day < 6 or hour_of_day > 22) else 0
    hba1c = request.hba1cResult if request.hba1cResult is not None else 6.5

    recent_mean = float(recent_arr.mean())
    row = pd.DataFrame([{
        "current_reading": request.currentReading,
        "recent_mean": recent_mean,
        "recent_std": float(recent_arr.std()),
        "recent_min": float(recent_arr.min()),
        "recent_max": float(recent_arr.max()),
        "recent_pct_abnormal": float(np.mean((recent_arr < HYPO_THRESHOLD) | (recent_arr > HYPER_THRESHOLD))),
        "medication_adherence_missed": int(request.medicationAdherenceMissed),
        "hba1c_result": hba1c,
        "hour_of_day": hour_of_day,
        "is_night": is_night,
        "delta_from_recent_mean": request.currentReading - recent_mean,
    }])[feature_columns]

    probabilities = model.predict_proba(row)[0]
    predicted_index = int(np.argmax(probabilities))
    risk_category = label_encoder.inverse_transform([predicted_index])[0]
    confidence = float(probabilities[predicted_index])

    # Non-negotiable clinical safety floor: a physiologically severe reading is always
    # EMERGENCY regardless of what the model's probabilities say (see train.py thresholds).
    if request.currentReading < SEVERE_HYPO_THRESHOLD or request.currentReading > EMERGENCY_HYPER_THRESHOLD:
        risk_category = "EMERGENCY_RISK"
        emergency_index = list(label_encoder.classes_).index("EMERGENCY_RISK")
        confidence = float(probabilities[emergency_index])

    signals = build_signals(request.currentReading, recent, request.medicationAdherenceMissed, request.hba1cResult)

    return RiskPredictionResponse(
        riskCategory=risk_category,
        triggeredSignals=signals,
        confidence=confidence,
        probabilities={cls: float(p) for cls, p in zip(label_encoder.classes_, probabilities)},
    )
