# Тестирование

Backend:
- Unit (pytest): detector, endpoints
- Интеграция: Google API mock/fallback
- Покрытие: 80%+

Frontend:
- E2E (Playwright): проверка потока / → POST → /report/[id]

Нагрузка:
- Locust: 100+ одновременных пользователей
