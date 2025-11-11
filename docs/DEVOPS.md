# DevOps

Мониторинг:
- Sentry (ошибки, performance)
- Render Logs

Бэкапы:
- pg_dump в S3 (CRON через GitHub Actions)

Кеш:
- Redis (Upstash/Render). Ключи запросов Google — TTL 30 дней.

CI:
- GitHub Actions: тесты + авто-деплой по push в main (опционально)
