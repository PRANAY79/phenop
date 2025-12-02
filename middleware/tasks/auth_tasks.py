# middleware/tasks/auth_tasks.py

import os
import requests
from middleware.celery_app import celery

BASE = os.getenv("NODE_BASE", "http://localhost:5000/api")

@celery.task(name="middleware.tasks.auth_tasks.signup")
def signup_task(payload):
    try:
        resp = requests.post(f"{BASE}/auth/register", json=payload, timeout=20)
        data = resp.json()

        if resp.status_code >= 400:
            return {"ok": False, "error": data.get("error", "Signup failed")}

        return {"ok": True, "data": data}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@celery.task(name="middleware.tasks.auth_tasks.verify")
def verify_task(payload):
    try:
        resp = requests.post(f"{BASE}/auth/verify", json=payload, timeout=20)
        data = resp.json()

        if resp.status_code >= 400:
            return {"ok": False, "error": data.get("error")}

        return {"ok": True, "data": data}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@celery.task(name="middleware.tasks.auth_tasks.login")
def login_task(payload):
    try:
        resp = requests.post(f"{BASE}/auth/login", json=payload, timeout=20)
        data = resp.json()

        if resp.status_code >= 400:
            return {"ok": False, "error": data.get("error")}

        return {"ok": True, "data": data}
    except Exception as e:
        return {"ok": False, "error": str(e)}
