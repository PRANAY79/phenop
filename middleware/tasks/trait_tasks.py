# middleware/tasks/trait_tasks.py

import os
import requests
from middleware.celery_app import celery

ML_URL = os.getenv("ML_TRAIT", "http://localhost:8000/predict_all")
NODE = os.getenv("NODE_BASE", "http://localhost:5000/api")

@celery.task(name="middleware.tasks.trait_tasks.predict")
def trait_predict_task(file_bytes, filename, username):
    try:
        files = {"file": (filename, file_bytes, "text/csv")}
        ml_resp = requests.post(ML_URL, files=files, timeout=180)
        ml_json = ml_resp.json() if ml_resp.ok else {
            "error": ml_resp.text,
            "status_code": ml_resp.status_code,
        }

        store_payload = {
            "username": username,
            "traits": ml_json.get("traits", ml_json)
        }
        store_resp = requests.post(f"{NODE}/predictions", json=store_payload, timeout=30)

        stored = store_resp.json() if store_resp.ok else {
            "error": store_resp.text,
            "status_code": store_resp.status_code,
        }

        return {"ok": True, "ml": ml_json, "stored": stored}

    except Exception as e:
        return {"ok": False, "error": str(e)}
