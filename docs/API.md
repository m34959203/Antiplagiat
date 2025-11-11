# API

База: https://antiplagiat-api.onrender.com

Эндпоинты:
- GET / — метаданные сервиса
- GET /health — состояние (DB, Google, env)
- POST /api/v1/check — создать проверку
  Request:
  {
    "text": "строка (>=100 симв.)",
    "mode": "fast|deep",
    "lang": "ru|en|kk",
    "exclude_quotes": true|false,
    "exclude_bibliography": true|false
  }
  Response: { "task_id": "...", "status": "completed", "estimated_time_seconds": 3|15 }

- GET /api/v1/check/{task_id} — получить результат
  Response: {
    "task_id","status","originality","total_words","total_chars",
    "matches":[{start,end,text,source_id,similarity,type}],
    "sources":[{id,title,url,domain,match_count}],
    "ai_powered": true|false
  }

- GET /api/v1/check — история (skip,limit)
  Response: { total, skip, limit, items:[] }

- GET /api/v1/stats — статистика платформы
  Response: { total_checks, avg_originality, today_checks }

- DELETE /api/v1/check/{task_id} — удалить запись

Замечания:
- Deep: реальный поиск через Google Custom Search (квота ограничена)
- Fast: эвристика (быстро)
- CORS: разрешены https://antiplagiat-frontend.onrender.com и http://localhost:3000
