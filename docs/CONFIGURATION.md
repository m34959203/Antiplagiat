# Конфигурация (.env)

Обязательные/важные:
- ENVIRONMENT: development|production
- DEBUG: True|False
- PORT: 10000 (Render)
- ALLOWED_ORIGINS: https://antiplagiat-frontend.onrender.com,http://localhost:3000
- DATABASE_URL: postgresql://... (если пусто — SQLite fallback)
- GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_CX
- OPENROUTER_API_KEY
- JWT_SECRET

Замечание:
- На Render не хранить .env в репозитории. Настраивать переменные через Dashboard.
