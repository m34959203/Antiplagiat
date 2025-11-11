# Операции (Runbook)

Проверка:
- GET /health — статус
- Логи Render — поиск ошибок/Traceback

Типичные инциденты:
- 500 при POST /check → смотреть логи; DB commit; Google API квоты
- CORS ошибка → проверить ALLOWED_ORIGINS на backend и в Render env

Дашборды/ссылки:
- Render Dashboard (api, frontend)
