# middleware/celery_app.py
import os
from celery import Celery

BROKER = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery = Celery(
    "phenopredict",
    broker=BROKER,
    backend=BROKER,
)

# WINDOWS SAFE IMPORT (CRITICAL)
import middleware.tasks.auth_tasks
import middleware.tasks.trait_tasks

celery.conf.task_routes = {
    "middleware.tasks.auth_tasks.*": {"queue": "auth_queue"},
    "middleware.tasks.trait_tasks.*": {"queue": "trait_queue"},
}

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    result_expires=3600,
)
