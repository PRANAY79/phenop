# redis_cache/otp_cache.py
import os
import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

def store_otp(email, otp, ttl_seconds=600):
    email = email.strip().lower()
    key = f"otp:{email}"
    r.setex(key, ttl_seconds, otp)

def get_otp(email):
    email = email.strip().lower()
    key = f"otp:{email}"
    return r.get(key)

def delete_otp(email):
    email = email.strip().lower()
    key = f"otp:{email}"
    r.delete(key)
