"""
Generates clinically-grounded synthetic training data for diabetes glycemic
risk classification, engineers features, trains an XGBoost classifier, and
saves the model + supporting artifacts to model/ for the FastAPI service to load.

Run with: python train.py
"""

import json

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

# Same clinical thresholds the Java rule-based service uses (mg/dL).
HYPO_THRESHOLD = 70
SEVERE_HYPO_THRESHOLD = 54
HYPER_THRESHOLD = 180
EMERGENCY_HYPER_THRESHOLD = 300

RISK_LABELS = ["LOW_RISK", "MODERATE_RISK", "HIGH_RISK", "EMERGENCY_RISK"]

FEATURE_COLUMNS = [
    "current_reading",
    "recent_mean",
    "recent_std",
    "recent_min",
    "recent_max",
    "recent_pct_abnormal",
    "medication_adherence_missed",
    "hba1c_result",
    "hour_of_day",
    "is_night",
    "delta_from_recent_mean",
]


def generate_synthetic_samples(n_samples: int, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    control_quality = rng.beta(2, 2, size=n_samples)

    hba1c_result = 10 - 4 * control_quality + rng.normal(0, 0.6, size=n_samples)
    hba1c_result = np.clip(hba1c_result, 5.0, 14.0)

    adherence_missed_p = np.clip(0.5 - 0.4 * control_quality, 0.0, 1.0)
    medication_adherence_missed = rng.binomial(1, adherence_missed_p)

    hour_of_day = rng.integers(0, 24, size=n_samples)

    baseline = 90 + (1 - control_quality) * 120
    reading_noise_std = 15 + (1 - control_quality) * 40

    current_reading = baseline + rng.normal(0, reading_noise_std, size=n_samples)
    current_reading = np.clip(current_reading, 30, 450)

    recent = baseline[:, None] + rng.normal(0, reading_noise_std[:, None], size=(n_samples, 5))
    recent = np.clip(recent, 30, 450)

    recent_mean = recent.mean(axis=1)
    recent_std = recent.std(axis=1)
    recent_min = recent.min(axis=1)
    recent_max = recent.max(axis=1)
    recent_pct_abnormal = ((recent < HYPO_THRESHOLD) | (recent > HYPER_THRESHOLD)).mean(axis=1)

    return pd.DataFrame({
        "control_quality": control_quality,
        "hba1c_result": hba1c_result,
        "medication_adherence_missed": medication_adherence_missed,
        "hour_of_day": hour_of_day,
        "current_reading": current_reading,
        "recent_mean": recent_mean,
        "recent_std": recent_std,
        "recent_min": recent_min,
        "recent_max": recent_max,
        "recent_pct_abnormal": recent_pct_abnormal,
    })


def label_risk(df: pd.DataFrame, seed: int = 123) -> pd.Series:
    rng = np.random.default_rng(seed)

    low_dist = np.maximum(0, HYPO_THRESHOLD - df["current_reading"]) / HYPO_THRESHOLD
    high_dist = np.maximum(0, df["current_reading"] - HYPER_THRESHOLD) / 120

    is_night = ((df["hour_of_day"] < 6) | (df["hour_of_day"] > 22)).astype(float)

    score = (
        low_dist * 3.0
        + high_dist * 2.5
        + df["recent_pct_abnormal"] * 1.5
        + df["medication_adherence_missed"] * 0.7
        + np.maximum(0, df["hba1c_result"] - 7) * 0.3
        + is_night * low_dist * 1.5
        + rng.normal(0, 0.3, size=len(df))
    )

    labels = np.select(
        [score >= 3.0, score >= 1.8, score >= 0.8],
        ["EMERGENCY_RISK", "HIGH_RISK", "MODERATE_RISK"],
        default="LOW_RISK",
    )

    hard_emergency = (df["current_reading"] < SEVERE_HYPO_THRESHOLD) | (df["current_reading"] > EMERGENCY_HYPER_THRESHOLD)
    labels = np.where(hard_emergency, "EMERGENCY_RISK", labels)

    return pd.Series(labels, index=df.index, name="risk_category")


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    features = df[[
        "current_reading", "recent_mean", "recent_std", "recent_min", "recent_max",
        "recent_pct_abnormal", "medication_adherence_missed", "hba1c_result", "hour_of_day",
    ]].copy()
    features["is_night"] = ((df["hour_of_day"] < 6) | (df["hour_of_day"] > 22)).astype(int)
    features["delta_from_recent_mean"] = df["current_reading"] - df["recent_mean"]
    return features[FEATURE_COLUMNS]


def main():
    df = generate_synthetic_samples(n_samples=20000, seed=42)
    labels = label_risk(df)
    features = engineer_features(df)

    print("Label distribution:")
    print(labels.value_counts())
    print()

    encoder = LabelEncoder()
    encoder.fit(RISK_LABELS)
    y = encoder.transform(labels)

    X_train, X_test, y_train, y_test = train_test_split(
        features, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        objective="multi:softprob",
        num_class=len(RISK_LABELS),
        eval_metric="mlogloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("Classification report:")
    print(classification_report(y_test, y_pred, target_names=encoder.classes_))
    print("Confusion matrix (rows=actual, cols=predicted):")
    print(pd.DataFrame(
        confusion_matrix(y_test, y_pred),
        index=encoder.classes_,
        columns=encoder.classes_,
    ))

    importances = dict(zip(FEATURE_COLUMNS, model.feature_importances_.tolist()))
    print("\nFeature importances:")
    for name, value in sorted(importances.items(), key=lambda kv: -kv[1]):
        print(f"  {name}: {value:.4f}")

    import os
    os.makedirs("model", exist_ok=True)
    joblib.dump(model, "model/risk_model.joblib")
    joblib.dump(encoder, "model/label_encoder.joblib")
    with open("model/feature_columns.json", "w") as f:
        json.dump(FEATURE_COLUMNS, f)

    print("\nSaved model/risk_model.joblib, model/label_encoder.joblib, model/feature_columns.json")


if __name__ == "__main__":
    main()
