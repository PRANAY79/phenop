# middleware/gateway.py

import os
import random
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from middleware.celery_app import celery
from middleware.tasks.auth_tasks import signup_task, login_task, verify_task
from middleware.tasks.trait_tasks import trait_predict_task
from redis_cache.otp_cache import store_otp, get_otp, delete_otp

GATEWAY_HOST = os.getenv("GATEWAY_HOST", "0.0.0.0")
GATEWAY_PORT = int(os.getenv("GATEWAY_PORT", "9000"))

app = FastAPI(title="Phenopredict Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ------------------ SIGNUP ------------------
@app.post("/signup")
async def signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):

    email = email.strip().lower()
    otp = f"{random.randint(100000, 999999):06d}"

    store_otp(email, otp, ttl_seconds=600)

    task = signup_task.delay({
        "name": name,
        "email": email,
        "password": password,
        "verificationCode": otp
    })

    return JSONResponse({"task_id": task.id})


# ------------------ VERIFY ------------------
@app.post("/verify")
async def verify(email: str = Form(...), code: str = Form(...)):
    email = email.strip().lower()
    code = str(code).strip()

    print("===================================")
    print("VERIFY REQUEST EMAIL:", email)
    print("VERIFY REQUEST CODE:", code)

    cached = get_otp(email)
    print("REDIS STORED OTP:", cached)

    if cached is None:
        print("→ OTP NOT FOUND IN REDIS")
        raise HTTPException(status_code=400, detail="OTP expired or not found")

    if str(cached) != code:
        print("→ OTP DOES NOT MATCH")
        raise HTTPException(status_code=400, detail="Invalid OTP")

    print("→ OTP MATCHED SUCCESSFULLY!")

    delete_otp(email)
    print("→ OTP DELETED FROM REDIS")

    task = verify_task.delay({"email": email, "code": code})
    return {"task_id": task.id}

# ------------------ LOGIN ------------------
@app.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    email = email.strip().lower()
    task = celery.send_task(
    "middleware.tasks.auth_tasks.login",
    args=[{"email": email, "password": password}]
)

    return JSONResponse({"task_id": task.id})


# ------------------ TRAIT ------------------
@app.post("/trait-predict")
async def trait_predict(username: str = Form(...), file: UploadFile = File(...)):
    b = await file.read()
    task = trait_predict_task.delay(b, file.filename, username)
    return JSONResponse({"task_id": task.id})


# ------------------ TASK RESULT ------------------
@app.get("/task/{task_id}")
async def get_task(task_id: str):
    res = celery.AsyncResult(task_id)
    return {"status": res.status, "result": res.result}
