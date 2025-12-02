# celery_workers/worker_auth.py
from middleware.celery_app import celery

# Force import task modules
import middleware.tasks.auth_tasks

if __name__ == "__main__":
    celery.start()
