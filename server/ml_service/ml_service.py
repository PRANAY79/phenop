import os
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import pandas as pd
import os, io, json

MONGO_URI = "mongodb+srv://sanhithm007_db_user:YekFggOscTDkj0rh@cluster0.g79uqy2.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["phenopredict"]
results_collection = db["trait_results"]

# ------------------ FASTAPI APP SETUP ------------------

app = FastAPI()

# Allow requests from frontend (Vite default port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ MODEL LOADING ------------------

MODEL_DIR = "multi_trait_models"
models = {}          # trait_name -> XGBRegressor
snp_columns_map = {} # trait_name -> [snp columns]

print("🔍 Loading models from:", os.path.abspath(MODEL_DIR))

if os.path.exists(MODEL_DIR):
    for trait in os.listdir(MODEL_DIR):
        trait_folder = os.path.join(MODEL_DIR, trait)
        model_path = os.path.join(trait_folder, f"{trait}_xgb.json")
        columns_path = os.path.join(trait_folder, "snp_columns.joblib")

        if os.path.isfile(model_path) and os.path.isfile(columns_path):
            try:
                print(f"📌 Loading model for {trait}")
                model = xgb.XGBRegressor()
                model.load_model(model_path)

                snp_cols = joblib.load(columns_path)

                models[trait] = model
                snp_columns_map[trait] = snp_cols
            except Exception as e:
                print(f"❌ Failed to load model for {trait}: {e}")
        else:
            print(f"⚠ Missing model or columns for {trait}, skipping...")
else:
    print("⚠ MODEL_DIR does not exist.")

print(f"✅ Models loaded: {list(models.keys())}")


# ------------------ BASIC HEALTH CHECK ------------------

@app.get("/")
def root():
    return {
        "status": "ML service running",
        "model_dir": os.path.abspath(MODEL_DIR),
        "loaded_traits": list(models.keys()),
    }


# ------------------ SINGLE TRAIT PREDICTION (OPTIONAL) ------------------

@app.post("/predict")
async def predict_single_trait(
    file: UploadFile = File(...),
    trait: str = Form(...)
):
    if trait not in models:
        return {"error": f"Trait '{trait}' not available. Loaded: {list(models.keys())}"}

    try:
        df = pd.read_csv(file.file)
    except Exception as e:
        return {"error": f"Could not read CSV: {e}"}

    required_cols = snp_columns_map[trait]
    missing = [c for c in required_cols if c not in df.columns]

    if missing:
        return {
            "error": f"Missing {len(missing)} SNP columns for trait {trait}. Example: {missing[:5]}"
        }

    X = df[required_cols].astype("float32")
    model = models[trait]
    preds = model.predict(X)

    preds = preds.astype(float)

    return {
        "trait": trait,
        "num_samples": len(preds),
        "mean_prediction": float(np.mean(preds)),
        "min_prediction": float(np.min(preds)),
        "max_prediction": float(np.max(preds)),
        "predictions": preds.tolist(),
    }


# ------------------ MULTI-TRAIT PREDICTION (YOUR OPTION C) ------------------

@app.post("/predict_all")
async def predict_all_traits(
    file: UploadFile = File(...)
):
    if not models:
        return {"error": "No models loaded on the server. Check multi_trait_models/ path."}

    try:
        df = pd.read_csv(file.file)
    except Exception as e:
        return {"error": f"Could not read CSV: {e}"}

    results = {}

    for trait, model in models.items():
        required_cols = snp_columns_map.get(trait, [])
        missing = [c for c in required_cols if c not in df.columns]

        if missing:
            results[trait] = {
                "error": f"Missing {len(missing)} required SNP columns. Example: {missing[:5]}"
            }
            continue

        X = df[required_cols].astype("float32")
        preds = model.predict(X).astype(float)

        results[trait] = {
            "num_samples": len(preds),
            "mean_prediction": float(np.mean(preds)),
            "min_prediction": float(np.min(preds)),
            "max_prediction": float(np.max(preds)),
            "sample_predictions": preds[:20].tolist(),  # first 20
        }

    return {
        "traits": results
    }
