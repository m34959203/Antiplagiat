# Безопасность

Базово:
- Secrets только в переменных окружения
- CORS: ограниченный список доменов
- JWT для будущей аутентификации
- Валидация входных данных (минимальные/макс. длины текста)
- SQLAlchemy ORM (без raw SQL)

Планы:
- Rate limiting (per-IP/per-key)
- API keys (B2B)
- Security headers
- Audit logs
