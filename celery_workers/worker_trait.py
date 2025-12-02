# celery_workers/worker_trait.py
import os
from middleware.celery_app import celery

if __name__ == "__main__":
    celery.worker_main(["worker", "--loglevel=info", "-Q", "trait_queue"])
