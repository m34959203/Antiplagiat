# Деплой (Render)

Сервисы:
- antiplagiat-api (Python/FastAPI)
- antiplagiat-frontend (Node/Next)

render.yaml:
- backend: uvicorn app.main:app --host 0.0.0.0 --port 10000
- envVars: ENVIRONMENT, ALLOWED_ORIGINS, GOOGLE_*, OPENROUTER_API_KEY, JWT_SECRET, DATABASE_URL (fromDatabase)

Заметки:
- DATABASE_URL обязателен для прод-хранения (иначе SQLite, эпемерный)
- CORS: должны быть фронт-домены
- Проверка деплоя: /health
