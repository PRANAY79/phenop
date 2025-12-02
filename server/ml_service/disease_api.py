# disease_api.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io
import tensorflow as tf
import uvicorn
import os

# CONFIG
MODEL_PATH = os.path.abspath("best_phase1.keras")  # adjust if needed
IMAGE_SIZE = (224, 224)
CLASS_LABELS = ['Bacterialblight','Blast','Brownspot','Tungro']  # from you
PORT = int(os.environ.get("DISEASE_PORT", 8001))

app = FastAPI(title="Disease Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict this to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    # ensure model outputs logits/probabilities; if model returns logits, we will apply softmax
    print("✅ Loaded disease model:", MODEL_PATH)
except Exception as e:
    print("❌ Failed to load model:", e)
    model = None

def preprocess_image_bytes(image_bytes: bytes, target_size=(224,224)):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(target_size)
    arr = np.asarray(img).astype("float32") / 255.0
    # model might expect shape (1, h, w, 3)
    return np.expand_dims(arr, axis=0)

@app.post("/predict_disease")
async def predict_disease(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")

    # validate file type
    filename = file.filename.lower()
    if not any(filename.endswith(ext) for ext in (".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Invalid image type. Upload .jpg/.jpeg/.png")

    try:
        contents = await file.read()
        x = preprocess_image_bytes(contents, target_size=IMAGE_SIZE)
        preds = model.predict(x)  # shape (1, num_classes) or (1,)
        preds = np.asarray(preds).squeeze()

        # If model gives scalar or single value, handle gracefully
        if preds.ndim == 0:
            # single output (e.g., regression); return as-is
            pred_index = 0
            confidence = float(preds)
            label = str(preds)
        else:
            # ensure probabilities
            if preds.sum() <= 1.0001 and np.all(preds >= 0):
                probs = preds
            else:
                # apply softmax
                exp = np.exp(preds - np.max(preds))
                probs = exp / exp.sum()

            top_idx = int(np.argmax(probs))
            label = CLASS_LABELS[top_idx] if top_idx < len(CLASS_LABELS) else f"class_{top_idx}"
            confidence = float(probs[top_idx])

        return JSONResponse({"prediction": label, "confidence": round(confidence, 6)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

if __name__ == "__main__":
    uvicorn.run("disease_api:app", host="0.0.0.0", port=PORT, reload=True)
