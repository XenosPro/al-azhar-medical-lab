from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from ucimlrepo import fetch_ucirepo

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.joblib"

TARGET = "class"

def clean_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip() for c in df.columns]
    return df.replace("?", pd.NA)

def main() -> None:
    dataset = fetch_ucirepo(id=336)

    X = clean_columns(dataset.data.features)
    y = clean_columns(dataset.data.targets)[TARGET].astype(str).str.strip().str.lower()

    numeric_columns = [
        "age", "bp", "sg", "al", "su", "bgr", "bu", "sc",
        "sod", "pot", "hemo", "pcv", "wbcc", "rbcc",
    ]
    categorical_columns = [
        "rbc", "pc", "pcc", "ba", "htn", "dm", "cad", "appet", "pe", "ane",
    ]

    numeric_columns = [c for c in numeric_columns if c in X.columns]
    categorical_columns = [c for c in categorical_columns if c in X.columns]

    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])

    preprocessor = ColumnTransformer([
        ("numeric", numeric_pipeline, numeric_columns),
        ("categorical", categorical_pipeline, categorical_columns),
    ])

    model = RandomForestClassifier(
        n_estimators=400,
        max_depth=12,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model),
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        stratify=y,
        random_state=42,
    )

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    probabilities = pipeline.predict_proba(X_test)[:, list(pipeline.classes_).index("ckd")]

    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(classification_report(y_test, predictions))
    print(f"ROC-AUC: {roc_auc_score((y_test == 'ckd').astype(int), probabilities):.4f}")

    artifact = {
        "pipeline": pipeline,
        "features": numeric_columns + categorical_columns,
        "classes": list(pipeline.classes_),
        "dataset": {
            "name": "Chronic Kidney Disease",
            "uci_id": 336,
            "source": "UCI Machine Learning Repository",
        },
        "disclaimer": (
            "Research/educational screening support only. "
            "This model is not a medical diagnosis."
        ),
    }

    joblib.dump(artifact, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")

if __name__ == "__main__":
    main()
