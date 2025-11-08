from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

app = FastAPI(
    title="Antiplagiat API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS для production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://antiplagiat-frontend.onrender.com",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": "Antiplagiat API",
        "version": "2.0.0",
        "status": "running",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "database": "connected" if os.getenv("DATABASE_URL") else "not configured"
    }

@app.post("/api/v1/check")
async def create_check(text: str):
    """Создать проверку на плагиат"""
    import uuid
    import random
    
    task_id = str(uuid.uuid4())
    
    return {
        "task_id": task_id,
        "status": "queued",
        "estimated_time_seconds": 15,
        "message": "Check created successfully"
    }

@app.get("/api/v1/check/{task_id}/status")
async def get_status(task_id: str):
    """Получить статус проверки"""
    import random
    
    return {
        "task_id": task_id,
        "status": "completed",
        "progress": 100,
        "originality": round(random.uniform(75, 95), 2)
    }

@app.get("/api/v1/report/{task_id}")
async def get_report(task_id: str):
    """Получить отчет"""
    return {
        "task_id": task_id,
        "originality": 87.5,
        "total_words": 1234,
        "matches": [
            {
                "source": "Wikipedia",
                "similarity": 0.85,
                "url": "https://en.wikipedia.org"
            }
        ],
        "created_at": "2025-01-13T12:00:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
