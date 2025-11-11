# Чек-лист (статус)

Сделано:
- FastAPI backend (основные эндпоинты)
- Deep/Google интеграция, расчет оригинальности (with similarity)
- SQLite fallback при пустом DATABASE_URL
- CORS: CORSMiddleware + ручной fallback-миддлварь
- Эндпоинты: POST/GET/DELETE /check, GET /check (list), GET /stats, /health
- Логирование + health
- Render конфиги (render.yaml)
- Фронт подключен к API

В работе/осталось:
- Устойчивый CORS на проде (проверка после деплоя)
- PostgreSQL на Render (убрать пустой DATABASE_URL)
- Alembic миграции
- Redis кеш (включить в проде)
- Тесты: unit/e2e/load, CI
- Monitoring: Sentry
- Rate limiting
- Auth (JWT), User endpoints
- Stripe (подписки), B2B API, Admin
- Бэкапы БД (CRON)
