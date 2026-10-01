# Al-Azhar Medical Lab — ML Screening Service

This service adds a laboratory-focused machine-learning component to Al-Azhar Medical Lab.

## Current model

The first model is a binary **chronic kidney disease (CKD) screening classifier** trained on the UCI Chronic Kidney Disease dataset (dataset ID 336).

The dataset contains 400 records and 24 clinical/laboratory input features, including blood pressure, urine measurements, glucose, blood urea, serum creatinine, electrolytes, hemoglobin, packed cell volume, white blood cell count and red blood cell count. The UCI dataset is licensed CC BY 4.0.

Source: https://archive.ics.uci.edu/dataset/336/chronic+kidney+disease

## Train

From the repository root:

```powershell
cd ai-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python train_model.py
```

This downloads the UCI dataset through `ucimlrepo`, trains the preprocessing + Random Forest pipeline, prints holdout metrics, and creates `model.joblib`.

## Run locally

```powershell
uvicorn app:app --reload --port 8001
```

Health check:

```
http://127.0.0.1:8001/health
```

The API is intended as **screening/decision-support research functionality only**, not as a diagnostic system.
