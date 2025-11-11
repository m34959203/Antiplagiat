# Архитектура

Компоненты:
- Backend: FastAPI (Python 3.12), сервис antiplagiat-api
- Frontend: Next.js 14 (TypeScript), сервис antiplagiat-frontend
- БД: PostgreSQL (prod) / SQLite (fallback)
- Кеш: Redis (опционально)
- Внешние API: Google Custom Search, OpenRouter (Gemini)
- Хостинг: Render.com

Потоки:
- Клиент → Frontend → Backend → (DB/Redis/Google/OpenRouter)
- Асинхронные вызовы: httpx (параллельно не используется, но готово)

Ключевые решения:
- CORS: CORSMiddleware + ручной fallback-миддлварь
- Fallback БД: если пустой DATABASE_URL — SQLite (для гарантированного старта)
- Логирование: базовое, структурированное
