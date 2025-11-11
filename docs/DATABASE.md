# База данных

Таблицы:
- check_results:
  task_id (pk), status, originality, total_words, total_chars,
  matches (JSON), sources (JSON), ai_powered (bool-as-string), created_at, user_id

Прод:
- PostgreSQL (Render DB). Переменная: DATABASE_URL (либо INTERNAL_URL)
- Если пусто — SQLite (ephemeral) → подходит для старта, но не для прод-хранения данных

Планы:
- Alembic миграции
- User, Subscriptions, Payments
- Индексы (created_at desc, user_id)
