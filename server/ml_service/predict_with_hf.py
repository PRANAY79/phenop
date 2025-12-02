# predict_with_hf.py
# FastAPI endpoint that:
# 1) Accepts an image upload
# 2) Calls local disease predictor at /predict_disease (if available)
# 3) Calls HuggingFace image-captioning model to get a caption
# 4) Calls HuggingFace text generation (Flan) to create suggestions
# 5) Saves result to MongoDB and returns JSON including a base64 image preview

import os
import io
import base64
import json
import requests
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")  # required for HF inference API
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test")
COLLECTION = os.getenv("DISEASE_COLLECTION", "disease_results")
LOCAL_DISEASE_URL = os.getenv("LOCAL_DISEASE_URL", "http://127.0.0.1:8001/predict_disease")

if HUGGINGFACE_TOKEN is None:
    print("⚠️ HUGGINGFACE_API_TOKEN not set. HF calls will fail unless you set env var.")

hf_headers = {"Authorization": f"Bearer {HUGGINGFACE_TOKEN}"} if HUGGINGFACE_TOKEN else {}

# Models (you can change to other HF model names if you want)
HF_IMAGE_CAPTION_MODEL = os.getenv("HF_IMAGE_MODEL", "nlpconnect/vit-gpt2-image-captioning")
HF_TEXT_MODEL = os.getenv("HF_TEXT_MODEL", "google/flan-t5-small")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your front-end origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB client
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION]


def to_data_url(file_bytes: bytes, mime: str = "image/jpeg") -> str:
    b64 = base64.b64encode(file_bytes).decode("utf-8")
    return f"data:{mime};base64,{b64}"


def call_hf_image_caption(image_bytes: bytes) -> Optional[str]:
    """
    Call HF inference API for image captioning.
    Returns the caption text or None on failure.
    """
    if not HUGGINGFACE_TOKEN:
        return None
    url = f"https://api-inference.huggingface.co/models/{HF_IMAGE_CAPTION_MODEL}"
    try:
        files = {"inputs": ("image.jpg", image_bytes, "image/jpeg")}
        # Some HF image models accept 'data' as binary; using files works widely.
        resp = requests.post(url, headers=hf_headers, files=files, timeout=30)
        if resp.status_code == 200:
            parsed = resp.json()
            # Many image-caption models return list of objects or a simple string
            if isinstance(parsed, list):
                # E.g. [{'generated_text': '...'}] or [{'caption': '...'}]
                if isinstance(parsed[0], dict):
                    for key in ("generated_text", "caption", "text"):
                        if key in parsed[0]:
                            return parsed[0][key]
                    # fallback: join values
                    return " ".join(str(v) for v in parsed[0].values())
                else:
                    return str(parsed[0])
            elif isinstance(parsed, dict) and "error" in parsed:
                print("HF caption error:", parsed["error"])
                return None
            else:
                return str(parsed)
        else:
            print("HF caption failed", resp.status_code, resp.text)
            return None
    except Exception as e:
        print("HF caption exception:", e)
        return None


def call_hf_text_generation(prompt: str, max_tokens: int = 150) -> Optional[str]:
    if not HUGGINGFACE_TOKEN:
        return None
    url = f"https://api-inference.huggingface.co/models/{HF_TEXT_MODEL}"
    try:
        payload = {"inputs": prompt, "parameters": {"max_new_tokens": max_tokens}}
        resp = requests.post(url, headers=hf_headers, json=payload, timeout=30)
        if resp.status_code == 200:
            parsed = resp.json()
            # flan returns list like [{'generated_text': '...'}]
            if isinstance(parsed, list) and isinstance(parsed[0], dict):
                return parsed[0].get("generated_text") or parsed[0].get("text")
            elif isinstance(parsed, dict) and "error" in parsed:
                print("HF text error:", parsed["error"])
                return None
            else:
                return str(parsed)
        else:
            print("HF text gen failed", resp.status_code, resp.text)
            return None
    except Exception as e:
        print("HF text exception:", e)
        return None


@app.post("/predict_with_hf")
async def predict_with_hf(file: UploadFile = File(...), username: Optional[str] = None):
    """
    Receives an image file. Returns:
    {
      "prediction": "Bacterialblight",
      "confidence": 0.87,
      "caption": "leaf with brown spots ...",
      "suggestions": ["...","...","..."],
      "image_base64": "data:image/..." 
    }
    """
    contents = await file.read()
    mime = file.content_type or "image/jpeg"
    data_url = to_data_url(contents, mime)

    # 1) Try local disease predictor first (local model)
    local_prediction = None
    try:
        # local predictor expects a multipart file at /predict_disease
        files = {"file": (file.filename, contents, mime)}
        resp = requests.post(LOCAL_DISEASE_URL, files=files, timeout=20)
        if resp.ok:
            local_json = resp.json()
            # Expecting structure: {"prediction": "...", "confidence": 0.xx}
            local_prediction = {
                "prediction": local_json.get("prediction"),
                "confidence": float(local_json.get("confidence", 0.0)) if local_json.get("confidence") is not None else None,
                "meta": local_json
            }
        else:
            print("Local disease predict failed:", resp.status_code, resp.text)
    except Exception as e:
        print("Local disease predictor error:", e)

    # 2) Get image caption from HF (optional)
    caption = call_hf_image_caption(contents)

    # 3) Build suggestions prompt
    # If local prediction is present, use that; else use caption-derived approximate label.
    disease_name = local_prediction["prediction"] if local_prediction and local_prediction.get("prediction") else None
    conf = local_prediction["confidence"] if local_prediction and local_prediction.get("confidence") is not None else None

    if not disease_name:
        # Try to extract a disease-like phrase from the caption
        disease_name = None
        if caption:
            # simple heuristic: look for keywords; fallback to first 3 words
            disease_name = " ".join(caption.split()[:3])
        else:
            disease_name = "unknown disease"

    prompt = (
        f"You are an agricultural expert. A farmer uploaded a rice leaf image. "
        f"Disease (predicted): {disease_name}. "
        f"Confidence: {conf if conf is not None else 'unknown'}. "
        f"Also image caption: {caption if caption else 'N/A'}. "
        f"Provide 3 short actionable management suggestions for the farmer (each 1 sentence). "
        f"Make them practical, safe, and concise. Number them or return as separate lines."
    )

    suggestions_text = call_hf_text_generation(prompt, max_tokens=150)
    suggestions = []
    if suggestions_text:
        # split into lines intelligently
        lines = [l.strip() for l in suggestions_text.splitlines() if l.strip()]
        # also try splitting by numbered lists "1." etc
        if not lines:
            suggestions = [suggestions_text.strip()]
        else:
            suggestions = lines
    else:
        # fallback default suggestions
        suggestions = [
            "Inspect nearby plants and remove heavily infected leaves into a bag (destroy them).",
            "Avoid overhead irrigation; improve air circulation and reduce humidity.",
            "Consult local extension or apply recommended fungicide/insecticide per label instructions."
        ]

    # 4) Save to MongoDB
    record = {
        "username": username or "anonymous",
        "filename": file.filename,
        "prediction": disease_name,
        "confidence": conf,
        "caption": caption,
        "suggestions": suggestions,
        "image_data_url": data_url,
        "raw_local_meta": local_prediction.get("meta") if local_prediction else None,
        "created_at": __import__("datetime").datetime.utcnow().isoformat()
    }

    try:
        collection.insert_one(record)
    except Exception as e:
        print("Mongo save error:", e)

    # 5) Return response
    return {
        "prediction": disease_name,
        "confidence": conf,
        "caption": caption,
        "suggestions": suggestions,
        "image_base64": data_url
    }
