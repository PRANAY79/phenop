start cmd /k python -m uvicorn ml_service:app --reload --port 8000
start cmd /k python -m uvicorn disease_api:app --reload --port 8001
start cmd /k python -m uvicorn predict_with_hf:app --reload --port 8002
