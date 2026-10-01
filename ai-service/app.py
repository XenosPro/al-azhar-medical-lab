from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.joblib"

app = FastAPI(
    title="Al-Azhar Medical Lab AI Service",
    version="0.1.0",
    description="ML screening support service for laboratory data.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

artifact = None

class LabScreeningRequest(BaseModel):
    age: float | None = Field(default=None, ge=0, le=120)
    bp: float | None = Field(default=None, ge=0, le=300)
    sg: float | None = Field(default=None, ge=1.0, le=1.1)
    al: float | None = Field(default=None, ge=0, le=5)
    su: float | None = Field(default=None, ge=0, le=5)
    rbc: str | None = None
    pc: str | None = None
    pcc: str | None = None
    ba: str | None = None
    bgr: float | None = Field(default=None, ge=0)
    bu: float | None = Field(default=None, ge=0)
    sc: float | None = Field(default=None, ge=0)
    sod: float | None = Field(default=None, ge=0)
    pot: float | None = Field(default=None, ge=0)
    hemo: float | None = Field(default=None, ge=0)
    pcv: float | None = Field(default=None, ge=0)
    wbcc: float | None = Field(default=None, ge=0)
    rbcc: float | None = Field(default=None, ge=0)
    htn: str | None = None
    dm: str | None = None
    cad: str | None = None
    appet: str | None = None
    pe: str | None = None
    ane: str | None = None

@app.on_event("startup")
def load_model() -> None:
    global artifact
    if MODEL_PATH.exists():
        artifact = joblib.load(MODEL_PATH)

@app.get("/health")
def health() -> dict:
    return {
        "status": "healthy",
        "model_loaded": artifact is not None,
    }

@app.post("/screen")
def screen(request: LabScreeningRequest) -> dict:
    if artifact is None:
        raise HTTPException(status_code=503, detail="ML model is not loaded.")

    row = pd.DataFrame([request.model_dump()])
    prediction = artifact["pipeline"].predict(row)[0]
    probabilities = artifact["pipeline"].predict_proba(row)[0]
    classes = artifact["pipeline"].classes_

    probability_map = {
        str(label): round(float(probability), 4)
        for label, probability in zip(classes, probabilities)
    }

    return {
        "prediction": str(prediction),
        "probabilities": probability_map,
        "message": (
            "Model-indicated CKD screening result. "
            "This is not a diagnosis and should not replace professional medical evaluation."
        ),
    }
