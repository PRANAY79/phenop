# redis_cache/rate_limit.py
import os
from redis import Redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = Redis.from_url(REDIS_URL)

def is_rate_limited(key, window_seconds=1):
    """
    Simple fixed-window rate limiter:
      key: unique identifier (ip or email)
    Returns True if rate-limited.
    """
    redis_key = f"lim:{key}"
    if r.get(redis_key):
        return True
    # set a short key to block repeated calls
    r.setex(redis_key, window_seconds, 1)
    return False
