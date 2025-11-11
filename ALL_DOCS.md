# Объединенная документация проекта Antiplagiat
**Дата создания:** 12.11.2025 00:06:26

---

## Оглавление

- [AI](#ai)
- [API](#api)
- [ARCHITECTURE](#architecture)
- [CHANGELOG](#changelog)
- [CHECKLIST](#checklist)
- [CONFIGURATION](#configuration)
- [CONTRIBUTING](#contributing)
- [DATABASE](#database)
- [DEPLOYMENT](#deployment)
- [DEVOPS](#devops)
- [FRONTEND](#frontend)
- [INDEX](#index)
- [OPERATIONS](#operations)
- [PROJECT_PLAN](#project_plan)
- [ROADMAP](#roadmap)
- [SECURITY](#security)
- [STYLEGUIDE](#styleguide)
- [TEAM](#team)
- [TECH_SPEC](#tech_spec)
- [TESTING](#testing)

---

# AI

**Файл:** AI.md

# AI/ML

Компоненты:
- Google Custom Search: точные совпадения (sentence-level)
- OpenRouter (Gemini): зарезервировано для парафразов (пока не вызывается из прод-пути)

Алгоритм deep:
- Разбивка текста на предложения (>40 символов)
- Проверка первых N предложений (до 5)
- Для каждого: запрос в Google с кавычками
- Сбор источников, расчёт оригинальности:
  originality = 100 - sum((len(match) * similarity) / total_chars * 100)

Ограничения:
- Квоты Google (важно добавить кеш Redis и отбор предложений)


---

# API

**Файл:** API.md

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


---

# ARCHITECTURE

**Файл:** ARCHITECTURE.md

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


---

# CHANGELOG

**Файл:** CHANGELOG.md

# Changelog

## 2025-11-11
- Добавлен ручной CORS fallback (OPTIONS/500)
- Фикс deep-детектора, логирование Google API
- Эндпоинты /check (history), /stats
- SQLite fallback для production (временная мера)


---

# CHECKLIST

**Файл:** CHECKLIST.md

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


---

# CONFIGURATION

**Файл:** CONFIGURATION.md

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


---

# CONTRIBUTING

**Файл:** CONTRIBUTING.md

# Contributing

Правила:
- Фичи/фиксы — через PR в main
- Обязателен код-ревью
- Тесты: обязателен зелёный билд
- Коммиты: feat/fix/chore/docs + описание
- Секреты — только в env (не в коде)


---

# DATABASE

**Файл:** DATABASE.md

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


---

# DEPLOYMENT

**Файл:** DEPLOYMENT.md

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


---

# DEVOPS

**Файл:** DEVOPS.md

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


---

# FRONTEND

**Файл:** FRONTEND.md

# Frontend (Next.js 14)

Структура:
- app/: страницы, включая /report/[id]
- lib/api.ts: клиент API
- Важно: NEXT_PUBLIC_API_URL указывает на backend

Требования:
- Обработка ошибок (toast)
- Скелетоны загрузки
- История переходов


---

# INDEX

**Файл:** INDEX.md

# Документация ANTIPLAGIAT

Карта документов:
- ARCHITECTURE.md — архитектура
- API.md — спецификация API
- DATABASE.md — схема БД и миграции
- AI.md — детектор и интеграции AI
- FRONTEND.md — структура фронтенда
- CONFIGURATION.md — переменные окружения
- DEPLOYMENT.md — деплой (Render)
- DEVOPS.md — мониторинг, логи, бэкапы
- SECURITY.md — безопасность
- TESTING.md — тестирование
- OPERATIONS.md — runbook (операции)
- ROADMAP.md — дорожная карта
- CHECKLIST.md — что сделано/что осталось
- CHANGELOG.md — изменения
- CONTRIBUTING.md — правила участия
- STYLEGUIDE.md — гайд по стилю кода


---

# OPERATIONS

**Файл:** OPERATIONS.md

# Операции (Runbook)

Проверка:
- GET /health — статус
- Логи Render — поиск ошибок/Traceback

Типичные инциденты:
- 500 при POST /check → смотреть логи; DB commit; Google API квоты
- CORS ошибка → проверить ALLOWED_ORIGINS на backend и в Render env

Дашборды/ссылки:
- Render Dashboard (api, frontend)


---

# PROJECT_PLAN

**Файл:** PROJECT_PLAN.md

# 📋 ПЛАН РЕАЛИЗАЦИИ ANTIPLAGIAT

## 🎯 ОБЩАЯ ЦЕЛЬ
Создать **production-ready AI-платформу** для проверки текстов на плагиат с монетизацией и масштабируемостью.

---

## 📅 TIMELINE (12 недель)

### ✅ ФАЗА 0: MVP DEPLOY (ЗАВЕРШЕНА)
**Срок:** 1 неделя  
**Статус:** ✅ DONE

**Результаты:**
- ✅ Frontend развернут на Render
- ✅ Backend развернут на Render
- ✅ Google Search API подключен
- ✅ Базовый UI/UX
- ✅ CI/CD настроен

---

### 🔥 ФАЗА 1: CORE FUNCTIONALITY (В ПРОЦЕССЕ)
**Срок:** 2-3 недели  
**Статус:** 🟡 40% DONE

#### Неделя 1-2: Backend + AI
**Backend Developer + ML Engineer**

**День 1-2: Критические баги** 🔴
- [ ] Исправить detector.py (расчет оригинальности)
- [ ] Добавить логирование всех шагов
- [ ] Unit-тесты для detector.py

**День 3-5: База данных**
- [ ] Переход с SQLite → PostgreSQL
- [ ] Alembic миграции
- [ ] Модели: User, Check, History
- [ ] Индексы для производительности

**День 6-10: API Endpoints**
- [ ] POST /api/v1/check (улучшение)
- [ ] GET /api/v1/check/{id}
- [ ] GET /api/v1/history (новый)
- [ ] DELETE /api/v1/check/{id}
- [ ] GET /api/v1/stats (новый)

**День 11-14: AI оптимизация**
- [ ] Улучшить промпты для Gemini
- [ ] Добавить fallback (если Google API недоступен)
- [ ] Кеширование результатов в Redis
- [ ] Rate limiting (60/min, 1000/day)

#### Неделя 2-3: Frontend
**Frontend Developer**

**День 1-3: Исправления**
- [ ] Фикс page.tsx (report/[id])
- [ ] Обработка ошибок API
- [ ] Loading states (скелетоны)
- [ ] Toast уведомления

**День 4-7: История проверок**
- [ ] Компонент History
- [ ] LocalStorage → API migration
- [ ] Фильтры (по дате, оригинальности)
- [ ] Pagination

**День 8-10: UX улучшения**
- [ ] Анимации (framer-motion)
- [ ] Responsive mobile
- [ ] Dark mode
- [ ] SEO (metadata)

#### Неделя 3: DevOps + QA
**DevOps Engineer + QA Engineer**

**DevOps:**
- [ ] PostgreSQL backup (автоматический)
- [ ] Sentry для мониторинга ошибок
- [ ] GitHub Actions (auto-deploy)
- [ ] Staging environment

**QA:**
- [ ] E2E тесты (Playwright)
- [ ] Load testing (100 concurrent users)
- [ ] API тесты (Postman/Newman)
- [ ] Тест-кейсы для детекции

**Критерии завершения Фазы 1:**
- ✅ Точность детекции ≥ 90%
- ✅ Все тесты проходят
- ✅ PostgreSQL работает
- ✅ История сохраняется
- ✅ 0 критических багов

---

### 🚀 ФАЗА 2: USER MANAGEMENT (4 недели)
**Срок:** Недели 4-7  
**Статус:** ⏳ TODO

#### Неделя 4-5: Авторизация
**Backend Developer**

**Authentication:**
- [ ] JWT tokens (access + refresh)
- [ ] POST /api/v1/auth/register
- [ ] POST /api/v1/auth/login
- [ ] POST /api/v1/auth/logout
- [ ] GET /api/v1/auth/me
- [ ] Password hashing (bcrypt)
- [ ] Email verification (опционально)

**Frontend Developer**
- [ ] Страница /login
- [ ] Страница /register
- [ ] Форма восстановления пароля
- [ ] Protected routes (middleware)
- [ ] Auth context (React Context)

#### Неделя 6-7: Dashboard
**Full-Stack**

**Backend:**
- [ ] GET /api/v1/user/dashboard (статистика)
- [ ] GET /api/v1/user/history
- [ ] PUT /api/v1/user/profile
- [ ] Upload avatar (Cloudinary)

**Frontend:**
- [ ] Страница /dashboard
- [ ] Графики (Chart.js / Recharts)
- [ ] Статистика: всего проверок, средняя оригинальность
- [ ] Таблица истории (фильтры, сортировка)
- [ ] Профиль пользователя

**Критерии завершения Фазы 2:**
- ✅ Регистрация работает
- ✅ JWT авторизация
- ✅ Dashboard с данными
- ✅ История сохраняется в БД
- ✅ 500+ зарегистрированных пользователей

---

### 💳 ФАЗА 3: MONETIZATION (4 недели)
**Срок:** Недели 8-11  
**Статус:** ⏳ TODO

#### Неделя 8-9: Платежная система
**Backend Developer + Product Manager**

**Stripe Integration:**
- [ ] Модели: Subscription, Payment
- [ ] POST /api/v1/payments/create-checkout
- [ ] Webhook /api/v1/payments/webhook
- [ ] Subscription management
- [ ] Invoice generation (PDF)

**Тарифы:**
| План | Цена | Проверок/месяц | Режим |
|------|------|----------------|-------|
| Free | \ | 3/день | Fast only |
| Basic | \.99 | 100/месяц | Fast + Deep |
| Pro | \.99 | Unlimited | Deep + API |
| Enterprise | Custom | Unlimited | API + Support |

**Frontend:**
- [ ] Страница /pricing
- [ ] Checkout flow
- [ ] Stripe Elements
- [ ] Success/Cancel pages
- [ ] Billing history

#### Неделя 10-11: B2B API
**Backend Developer**

**API для бизнеса:**
- [ ] API Keys (генерация)
- [ ] Rate limiting (per key)
- [ ] Webhook для результатов
- [ ] API документация (Swagger)
- [ ] SDK (Python, JavaScript)

**Admin Panel:**
- [ ] Страница /admin (Next.js)
- [ ] Управление пользователями
- [ ] Статистика платежей
- [ ] Логи API запросов

**Критерии завершения Фазы 3:**
- ✅ Stripe работает
- ✅ Подписки активируются
- ✅ B2B API доступен
- ✅ \ MRR (месячный доход)

---

### 🌟 ФАЗА 4: SCALE & OPTIMIZE (1 неделя)
**Срок:** Неделя 12  
**Статус:** ⏳ TODO

**DevOps Engineer + Backend Developer**

**Performance:**
- [ ] Redis caching (результаты на 1 час)
- [ ] PostgreSQL query optimization
- [ ] CDN для статики (Cloudflare)
- [ ] Database sharding (если >100k users)

**Monitoring:**
- [ ] Grafana + Prometheus
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics 4)

**Security:**
- [ ] Rate limiting (DDoS protection)
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] HTTPS enforcement

**Критерии завершения Фазы 4:**
- ✅ Response time < 500ms
- ✅ Uptime > 99.9%
- ✅ 10,000+ проверок/день
- ✅ 0 security issues

---

## 📊 МЕТРИКИ УСПЕХА

### KPI по фазам:

| Фаза | Метрика | Цель |
|------|---------|------|
| Фаза 1 | Точность детекции | ≥90% |
| Фаза 1 | Проверок/день | 1000+ |
| Фаза 2 | Registered users | 500+ |
| Фаза 2 | DAU (Daily Active) | 100+ |
| Фаза 3 | MRR (Monthly Revenue) | \+ |
| Фаза 3 | Paid users | 50+ |
| Фаза 4 | Uptime | 99.9%+ |
| Фаза 4 | Response time | <500ms |

---

## 🛠️ ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Backend:
- **Framework:** FastAPI 0.109+
- **Language:** Python 3.12
- **Database:** PostgreSQL 16 (pgvector)
- **Cache:** Redis 7.2
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Auth:** python-jose (JWT)
- **Tasks:** Celery + Redis
- **AI:** OpenRouter (Gemini 2.0)
- **Search:** Google Custom Search API

### Frontend:
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.4
- **State:** React Context + SWR
- **Charts:** Recharts
- **Animations:** framer-motion
- **Forms:** react-hook-form
- **HTTP:** fetch API

### DevOps:
- **Hosting:** Render.com
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry
- **Analytics:** Google Analytics 4
- **CDN:** Cloudflare
- **Email:** SendGrid

### Tools:
- **Version Control:** Git + GitHub
- **Testing:** pytest, Playwright, Jest
- **Load Testing:** Locust
- **API Testing:** Postman
- **Design:** Figma
- **Docs:** Markdown + Mermaid

---

## 🚨 РИСКИ И МИТИГАЦИЯ

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Google API квота | HIGH | HIGH | Fallback на Bing API |
| PostgreSQL downtime | MEDIUM | HIGH | Automated backups |
| AI hallucinations | MEDIUM | MEDIUM | Human review для edge cases |
| Slow response time | MEDIUM | HIGH | Redis caching, CDN |
| Security breach | LOW | CRITICAL | Penetration testing, audits |

---

## 📞 КОММУНИКАЦИЯ

### Daily Standups:
- **Время:** 10:00 UTC
- **Формат:** Async (Slack/Discord)
- **Вопросы:** 
  - Что сделал вчера?
  - Что делаю сегодня?
  - Какие блокеры?

### Weekly Review:
- **Время:** Пятница 15:00 UTC
- **Участники:** Вся команда
- **Цель:** Демо, ретроспектива

### Tools:
- **Code:** GitHub
- **Tasks:** Linear / Jira
- **Docs:** Notion / Google Docs
- **Chat:** Slack / Discord
- **Video:** Zoom / Google Meet

---

## 🎓 ОБУЧЕНИЕ КОМАНДЫ

### Backend:
- [ ] FastAPI Best Practices
- [ ] PostgreSQL Performance Tuning
- [ ] AI Prompt Engineering

### Frontend:
- [ ] Next.js 14 App Router
- [ ] TypeScript Advanced Types
- [ ] Performance Optimization

### DevOps:
- [ ] Render.com Advanced Features
- [ ] Docker Best Practices
- [ ] CI/CD Optimization

---

## 🏁 ИТОГИ

**Общий Timeline:** 12 недель
**Команда:** 8 человек
**Бюджет:** ~\ (зарплаты + инфраструктура)
**Цель:** Production-ready платформа с \ MRR

**Следующий шаг:** 🔥 Исправить критический баг в detector.py


---

# ROADMAP

**Файл:** ROADMAP.md

# Roadmap

Фаза 1 (Core):
- Починить расчет оригинальности — сделано
- Google Search интеграция — сделано
- CORS прод — в процессе (ручной fallback добавлен)
- История/статистика эндпоинты — сделано
- Логи/Health — сделано

Фаза 2 (User Management):
- JWT auth, /auth/*
- Dashboard
- История по пользователю

Фаза 3 (Monetization):
- Stripe
- Подписки
- B2B API keys

Фаза 4 (Scale):
- Redis кеш
- Оптимизация БД (PG)
- Мониторинг, бэкапы


---

# SECURITY

**Файл:** SECURITY.md

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


---

# STYLEGUIDE

**Файл:** STYLEGUIDE.md

# Стиль кода

Python:
- PEP8, типы, docstring где нужно
- Логи структурированные

TypeScript:
- Strict где возможно
- Композиция компонентов, без дублирования

Git:
- Мелкие PR, понятные сообщения


---

# TEAM

**Файл:** TEAM.md

# 👥 КОМАНДА ПРОЕКТА ANTIPLAGIAT

## 1️⃣ DMITRY (Tech Lead / Full-Stack Architect)
**Роль:** Техлид, архитектор решения
**Ответственность:**
- Общая архитектура системы
- Код-ревью всех компонентов
- Интеграция Backend ↔ Frontend ↔ AI
- Принятие технических решений
- GitHub: управление репозиторием, CI/CD

**Стек:** Python, TypeScript, Docker, PostgreSQL, Render
**Приоритет:** Фаза 1 - интеграция и стабилизация MVP

---

## 2️⃣ BACKEND DEVELOPER (Python/FastAPI)
**Роль:** Разработка серверной части
**Ответственность:**
- FastAPI endpoints (создание, оптимизация)
- Алгоритм детекции плагиата (detector.py)
- Google Search API интеграция
- OpenRouter AI интеграция
- PostgreSQL миграции (SQLAlchemy/Alembic)
- Redis для кеша и очередей

**Задачи:**
- ✅ Исправить расчет оригинальности
- ⏳ Настроить PostgreSQL на Render
- ⏳ Добавить user authentication (JWT)
- ⏳ Создать endpoints для истории

---

## 3️⃣ FRONTEND DEVELOPER (Next.js/TypeScript)
**Роль:** Клиентская часть
**Ответственность:**
- Next.js 14 App Router
- TypeScript компоненты
- Интеграция с Backend API
- UI/UX implementation
- Responsive design

**Задачи:**
- ✅ Исправить page.tsx (report)
- ⏳ Добавить анимации загрузки
- ⏳ Dashboard пользователя
- ⏳ История проверок (UI)

---

## 4️⃣ ML/AI ENGINEER
**Роль:** AI/ML интеграция
**Ответственность:**
- Google Gemini 2.0 промпты
- OpenRouter API оптимизация
- Детекция парафраз (AI)
- Google Custom Search настройка
- Кросс-языковая проверка (ru/en/kk)

**Задачи:**
- ⏳ Улучшить точность детекции
- ⏳ Добавить semantic similarity
- ⏳ Обучить модель на датасете

---

## 5️⃣ DevOPS ENGINEER
**Роль:** Инфраструктура и деплой
**Ответственность:**
- Render.com configuration
- Docker/docker-compose
- CI/CD (GitHub Actions)
- Мониторинг (Sentry, LogRocket)
- Backup & Recovery

**Задачи:**
- ⏳ Настроить auto-deploy из main
- ⏳ Добавить staging окружение
- ⏳ Настроить Sentry
- ⏳ PostgreSQL backup

---

## 6️⃣ QA ENGINEER
**Роль:** Тестирование
**Ответственность:**
- E2E тесты (Playwright)
- Unit tests (pytest, Jest)
- Load testing (Locust)
- Тестирование API

**Задачи:**
- ⏳ Написать тесты для detector.py
- ⏳ E2E тесты для страницы проверки
- ⏳ Load testing для 1000 req/min

---

## 7️⃣ PRODUCT MANAGER
**Роль:** Продуктовая стратегия
**Ответственность:**
- Roadmap проекта
- Feature prioritization
- User feedback
- Metrics & Analytics

**Цели:**
- Фаза 1: 1000+ проверок/день
- Фаза 2: 500 registered users
- Фаза 3: \ MRR

---

## 8️⃣ UI/UX DESIGNER
**Роль:** Дизайн интерфейсов
**Ответственность:**
- Figma макеты
- Design system
- User flow
- A/B тесты

**Задачи:**
- ⏳ Редизайн главной страницы
- ⏳ Dashboard design
- ⏳ Mobile version

---

## 📊 ТЕКУЩЕЕ РАСПРЕДЕЛЕНИЕ ЗАДАЧ

### SPRINT 1 (ФАЗА 1) - 2 недели
| Задача | Исполнитель | Статус |
|--------|-------------|--------|
| Исправить расчет оригинальности | Backend Dev | 🔴 CRITICAL |
| Фикс page.tsx (report) | Frontend Dev | 🟡 HIGH |
| PostgreSQL на Render | DevOps | 🟡 HIGH |
| Тесты detector.py | QA | 🟢 MEDIUM |
| История проверок (API) | Backend Dev | 🟢 MEDIUM |
| История проверок (UI) | Frontend Dev | 🟢 MEDIUM |

### SPRINT 2 (ФАЗА 2) - 3 недели
| Задача | Исполнитель | Статус |
|--------|-------------|--------|
| JWT Authentication | Backend Dev | ⏳ TODO |
| Регистрация/Логин (UI) | Frontend Dev | ⏳ TODO |
| Dashboard пользователя | Frontend + Backend | ⏳ TODO |
| Email уведомления | Backend Dev | ⏳ TODO |

### SPRINT 3 (ФАЗА 3) - 4 недели
| Задача | Исполнитель | Статус |
|--------|-------------|--------|
| Stripe Integration | Backend Dev | ⏳ TODO |
| Тарифные планы | Product Manager | ⏳ TODO |
| Admin Panel | Full-Stack | ⏳ TODO |


---

# TECH_SPEC

**Файл:** TECH_SPEC.md

# 📖 ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ ANTIPLAGIAT

## 📚 СОДЕРЖАНИЕ
1. [Обзор системы](#overview)
2. [Архитектура](#architecture)
3. [Backend API](#backend)
4. [Frontend](#frontend)
5. [База данных](#database)
6. [AI/ML компоненты](#ai)
7. [Безопасность](#security)
8. [Производительность](#performance)
9. [Deployment](#deployment)

---

<a name="overview"></a>
## 1. ОБЗОР СИСТЕМЫ

### Назначение
**Antiplagiat** — AI-powered платформа для проверки текстов на плагиат с использованием:
- Google Custom Search API (реальные источники)
- Google Gemini 2.0 (детекция парафраз)
- Semantic similarity (NLP)

### Целевая аудитория
- 🎓 Студенты (курсовые, дипломы)
- 📝 Авторы (блогеры, копирайтеры)
- 🏢 Компании (проверка контента)
- 🎯 Преподаватели (проверка работ)

### Ключевые фичи
- ⚡ **Fast режим:** Эвристическая проверка (~5 сек)
- 🤖 **Deep режим:** AI + Google Search (~15 сек)
- 🌐 **Мультиязычность:** Русский, English, Қазақ
- 📊 **Детальные отчеты:** % оригинальности, источники, совпадения
- 💾 **История проверок:** Сохранение результатов
- 💳 **Подписки:** Free/Basic/Pro/Enterprise

---

<a name="architecture"></a>
## 2. АРХИТЕКТУРА

\\\mermaid
graph TB
    User[👤 Пользователь] --> FE[🌐 Frontend<br/>Next.js 14]
    FE --> API[🐍 Backend API<br/>FastAPI]
    API --> DB[(🗄️ PostgreSQL)]
    API --> Redis[(⚡ Redis<br/>Cache)]
    API --> Google[🤖 Google APIs]
    Google --> Gemini[Gemini 2.0]
    Google --> Search[Custom Search]
    API --> Queue[📬 Celery Queue]
    Queue --> Workers[⚙️ Workers]
\\\

### Компоненты

#### Frontend (Next.js 14)
- **Роль:** UI/UX, клиентская логика
- **Технологии:** TypeScript, Tailwind CSS
- **Деплой:** Render Static Site
- **URL:** https://antiplagiat-frontend.onrender.com

#### Backend API (FastAPI)
- **Роль:** Business logic, AI integration
- **Технологии:** Python 3.12, FastAPI 0.109
- **Деплой:** Render Web Service
- **URL:** https://antiplagiat-api.onrender.com

#### Database (PostgreSQL 16)
- **Роль:** Persistent storage
- **Расширения:** pgvector (для embeddings)
- **Деплой:** Render PostgreSQL

#### Cache (Redis)
- **Роль:** Кеширование результатов, очереди
- **TTL:** 1 час для результатов
- **Деплой:** Render Redis (или Upstash)

#### AI Services
1. **Google Gemini 2.0** (через OpenRouter)
   - Детекция парафраз
   - Semantic similarity
   
2. **Google Custom Search**
   - Поиск реальных источников
   - Проверка цитат

---

<a name="backend"></a>
## 3. BACKEND API

### 3.1 Структура проекта

\\\
backend/public-api/
├── app/
│   ├── main.py              # FastAPI app
│   ├── models.py            # SQLAlchemy models
│   ├── core/
│   │   ├── config.py        # Settings (pydantic)
│   │   ├── security.py      # JWT, hashing
│   │   └── database.py      # DB session
│   ├── services/
│   │   ├── detector.py      # Plagiarism detection
│   │   ├── ai.py            # OpenRouter integration
│   │   └── google_search.py # Google API
│   ├── routers/
│   │   ├── check.py         # /api/v1/check
│   │   ├── auth.py          # /api/v1/auth
│   │   ├── user.py          # /api/v1/user
│   │   └── admin.py         # /api/v1/admin
│   └── tests/
│       ├── test_detector.py
│       └── test_api.py
├── requirements.txt
└── pyproject.toml
\\\

### 3.2 API Endpoints

#### Authentication
\\\http
POST   /api/v1/auth/register      # Регистрация
POST   /api/v1/auth/login         # Вход (получить JWT)
POST   /api/v1/auth/logout        # Выход
POST   /api/v1/auth/refresh       # Обновить токен
GET    /api/v1/auth/me            # Текущий пользователь
\\\

#### Plagiarism Check
\\\http
POST   /api/v1/check              # Создать проверку
GET    /api/v1/check/{id}         # Получить результат
DELETE /api/v1/check/{id}         # Удалить проверку
GET    /api/v1/check              # Список проверок (история)
\\\

**Request Body (POST /api/v1/check):**
\\\json
{
  "text": "Текст для проверки...",
  "mode": "deep",                    // fast | deep
  "lang": "ru",                      // ru | en | kk
  "exclude_quotes": true,
  "exclude_bibliography": true
}
\\\

**Response:**
\\\json
{
  "task_id": "uuid-here",
  "status": "completed",
  "estimated_time_seconds": 15
}
\\\

**Result (GET /api/v1/check/{id}):**
\\\json
{
  "task_id": "uuid",
  "status": "completed",
  "originality": 87.5,
  "total_words": 542,
  "total_chars": 3421,
  "matches": [
    {
      "start": 120,
      "end": 245,
      "text": "Совпавший фрагмент...",
      "source_id": 12345,
      "similarity": 0.95,
      "type": "google_exact"
    }
  ],
  "sources": [
    {
      "id": 12345,
      "title": "Источник",
      "url": "https://example.com",
      "domain": "example.com",
      "match_count": 3
    }
  ],
  "created_at": "2025-11-11T00:00:00Z",
  "ai_powered": true,
  "note": "Deep режим с Google Search"
}
\\\

#### User
\\\http
GET    /api/v1/user/dashboard      # Статистика пользователя
GET    /api/v1/user/history        # История проверок
PUT    /api/v1/user/profile        # Обновить профиль
\\\

#### Admin (Protected)
\\\http
GET    /api/v1/admin/users         # Все пользователи
GET    /api/v1/admin/stats         # Статистика платформы
DELETE /api/v1/admin/user/{id}     # Удалить пользователя
\\\

### 3.3 Алгоритм детекции (detector.py)

**Псевдокод:**

\\\python
def detect_plagiarism(text: str, mode: str) -> Result:
    if mode == "fast":
        return fast_heuristic_check(text)
    
    elif mode == "deep":
        # Шаг 1: Разбить на предложения
        sentences = split_into_sentences(text)
        
        # Шаг 2: Поиск в Google
        matches = []
        for sentence in sentences[:10]:  # Первые 10
            google_results = google_search(sentence)
            for result in google_results:
                matches.append({
                    "text": sentence,
                    "source": result,
                    "similarity": 0.95  # Точное совпадение
                })
        
        # Шаг 3: AI проверка парафраз
        for sentence in sentences:
            if not has_exact_match(sentence):
                ai_result = check_paraphrase_ai(sentence)
                if ai_result.is_paraphrase:
                    matches.append({
                        "text": sentence,
                        "similarity": ai_result.similarity,
                        "type": "semantic_ai"
                    })
        
        # Шаг 4: Расчет оригинальности
        total_chars = len(text)
        matched_chars = sum(
            len(m['text']) * m['similarity'] 
            for m in matches
        )
        originality = 100 - (matched_chars / total_chars * 100)
        
        return {
            "originality": round(originality, 2),
            "matches": matches,
            "sources": extract_sources(matches)
        }
\\\

**Оптимизации:**
- 🔄 Кеширование в Redis (ключ: hash(text))
- 📊 Batch processing для длинных текстов
- ⚡ Async/await для параллельных запросов

---

<a name="frontend"></a>
## 4. FRONTEND

### 4.1 Структура проекта

\\\
frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Главная страница
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── report/
│   │   └── [id]/
│   │       └── page.tsx     # Результат проверки
│   └── pricing/
│       └── page.tsx
├── lib/
│   ├── api.ts               # API client
│   ├── auth.ts              # Auth helpers
│   └── utils.ts
├── components/
│   ├── Header.tsx
│   ├── CheckForm.tsx
│   ├── HistoryList.tsx
│   └── PricingCard.tsx
├── styles/
│   └── globals.css
├── public/
│   └── images/
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
\\\

### 4.2 Страницы

#### Home (/)
- Hero section
- Форма проверки текста
- Режимы (Fast/Deep)
- Языки (ru/en/kk)
- История последних проверок

#### Report (/report/[id])
- Процент оригинальности (большой)
- Статистика (слова, символы, совпадения)
- Список совпадений (выделение)
- Источники (ссылки)
- Кнопки: Поделиться, Скачать PDF

#### Dashboard (/dashboard)
- Статистика пользователя
- График проверок по дням
- Таблица истории (фильтры)
- Тарифный план

#### Pricing (/pricing)
- Карточки тарифов
- Сравнение функций
- Stripe Checkout

### 4.3 Компоненты

**CheckForm.tsx:**
\\\	sx
interface CheckFormProps {
  onSubmit: (data: CheckRequest) => void
}

export function CheckForm({ onSubmit }: CheckFormProps) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'fast' | 'deep'>('fast')
  
  const handleSubmit = async () => {
    const result = await apiClient.createCheck({
      text, mode,
      lang: 'ru',
      exclude_quotes: true
    })
    
    router.push(\/report/\\)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="fast">⚡ Fast</option>
        <option value="deep">🤖 Deep AI</option>
      </select>
      <button type="submit">Проверить</button>
    </form>
  )
}
\\\

---

<a name="database"></a>
## 5. БАЗА ДАННЫХ

### 5.1 Schema (PostgreSQL)

**Users:**
\\\sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    api_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key ON users(api_key);
\\\

**Check_Results:**
\\\sql
CREATE TABLE check_results (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    originality FLOAT,
    total_words INTEGER,
    total_chars INTEGER,
    matches JSONB,
    sources JSONB,
    ai_powered BOOLEAN DEFAULT FALSE,
    mode VARCHAR(20),
    lang VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_check_user ON check_results(user_id);
CREATE INDEX idx_check_created ON check_results(created_at DESC);
\\\

**Subscriptions:**
\\\sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
\\\

**Payments:**
\\\sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    stripe_payment_id VARCHAR(255) UNIQUE,
    amount INTEGER,
    currency VARCHAR(10) DEFAULT 'usd',
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
\\\

### 5.2 Миграции (Alembic)

\\\ash
# Создать миграцию
alembic revision --autogenerate -m "Add subscriptions table"

# Применить
alembic upgrade head

# Откатить
alembic downgrade -1
\\\

---

<a name="ai"></a>
## 6. AI/ML КОМПОНЕНТЫ

### 6.1 Google Gemini 2.0 (через OpenRouter)

**Эндпоинт:** https://openrouter.ai/api/v1/chat/completions

**Модель:** \google/gemini-2.0-flash-exp:free\

**Промпт для детекции парафраза:**
\\\
Сравни два текста и определи, является ли второй парафразом первого.

Оригинал: {original_text}
Проверяемый: {check_text}

Ответь в JSON:
{
  "is_paraphrase": true/false,
  "similarity": 0.0-1.0,
  "explanation": "..."
}
\\\

**Обработка ответа:**
\\\python
async def check_paraphrase(original: str, check: str) -> dict:
    response = await openrouter_client.chat(
        model="google/gemini-2.0-flash-exp:free",
        messages=[{
            "role": "user",
            "content": prompt
        }],
        temperature=0.3
    )
    
    result = json.loads(response.content)
    return result
\\\

### 6.2 Google Custom Search API

**Квота:** 100 запросов/день (Free tier)

**Пример запроса:**
\\\python
import httpx

def google_search(query: str, api_key: str, cx: str) -> list:
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": api_key,
        "cx": cx,
        "q": f'"{query}"',  # Точное совпадение
        "num": 5
    }
    
    response = httpx.get(url, params=params)
    data = response.json()
    
    return [
        {
            "title": item["title"],
            "url": item["link"],
            "domain": item["displayLink"]
        }
        for item in data.get("items", [])
    ]
\\\

---

<a name="security"></a>
## 7. БЕЗОПАСНОСТЬ

### 7.1 Аутентификация (JWT)

**Access Token:**
- Срок действия: 15 минут
- Payload: \{user_id, email, exp}\

**Refresh Token:**
- Срок действия: 7 дней
- Хранение: httpOnly cookie

**Генерация:**
\\\python
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
\\\

### 7.2 Хеширование паролей

\\\python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
\\\

### 7.3 Rate Limiting

**Middleware (slowapi):**
\\\python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/check")
@limiter.limit("60/minute")
async def create_check(request: Request, data: CheckRequest):
    ...
\\\

### 7.4 CORS

\\\python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://antiplagiat-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
\\\

---

<a name="performance"></a>
## 8. ПРОИЗВОДИТЕЛЬНОСТЬ

### 8.1 Кеширование (Redis)

**Кеш результатов:**
\\\python
import redis
import hashlib
import json

redis_client = redis.from_url("redis://localhost:6379")

def get_cached_result(text: str) -> dict | None:
    key = f"check:{hashlib.md5(text.encode()).hexdigest()}"
    cached = redis_client.get(key)
    return json.loads(cached) if cached else None

def cache_result(text: str, result: dict):
    key = f"check:{hashlib.md5(text.encode()).hexdigest()}"
    redis_client.setex(key, 3600, json.dumps(result))  # 1 час
\\\

### 8.2 Async/Await

**Параллельные запросы к Google:**
\\\python
import asyncio
import httpx

async def check_multiple_sentences(sentences: list) -> list:
    async with httpx.AsyncClient() as client:
        tasks = [
            google_search_async(client, sentence)
            for sentence in sentences
        ]
        return await asyncio.gather(*tasks)
\\\

### 8.3 Database Optimization

**Индексы:**
\\\sql
CREATE INDEX idx_check_user_created ON check_results(user_id, created_at DESC);
CREATE INDEX idx_check_status ON check_results(status) WHERE status = 'pending';
\\\

**Connection Pooling:**
\\\python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True
)
\\\

---

<a name="deployment"></a>
## 9. DEPLOYMENT

### 9.1 Render.com Configuration

**render.yaml:**
\\\yaml
services:
  - type: web
    name: antiplagiat-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port 10000
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: antiplagiat-db
          property: connectionString
      - key: REDIS_URL
        value: redis://...
      - key: OPENROUTER_API_KEY
        sync: false
      - key: GOOGLE_SEARCH_API_KEY
        sync: false

  - type: web
    name: antiplagiat-frontend
    env: node
    buildCommand: cd frontend && npm install && npm run build
    startCommand: cd frontend && npm start

databases:
  - name: antiplagiat-db
    plan: free
\\\

### 9.2 CI/CD (GitHub Actions)

**.github/workflows/deploy.yml:**
\\\yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        run: |
          pip install -r backend/public-api/requirements.txt
          pytest backend/public-api/app/tests/
      
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/deploy/...
\\\

### 9.3 Environment Variables

**Backend (.env):**
\\\env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENROUTER_API_KEY=sk-...
GOOGLE_SEARCH_API_KEY=AIza...
GOOGLE_SEARCH_CX=...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
\\\

**Frontend (.env.local):**
\\\env
NEXT_PUBLIC_API_URL=https://antiplagiat-api.onrender.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
\\\

---

## 📊 MONITORING

### Sentry (Error Tracking)
\\\python
import sentry_sdk

sentry_sdk.init(
    dsn="https://...@sentry.io/...",
    traces_sample_rate=0.1
)
\\\

### Logging
\\\python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("Check created: {task_id}")
\\\

---

## 🧪 TESTING

### Backend (pytest)
\\\python
def test_detector_accuracy():
    text = "Искусственный интеллект..."
    result = detector.analyze(text, mode="fast")
    assert 0 <= result['originality'] <= 100
\\\

### Frontend (Playwright)
\\\	ypescript
test('user can check text', async ({ page }) => {
  await page.goto('/')
  await page.fill('textarea', 'Test text...')
  await page.click('button:has-text("Проверить")')
  await expect(page).toHaveURL(/\/report\//)
})
\\\

---

## 📚 ДОКУМЕНТАЦИЯ

- **API Docs:** /docs (Swagger UI)
- **ReDoc:** /redoc
- **Architecture:** /docs/ARCHITECTURE.md
- **Contributing:** /docs/CONTRIBUTING.md

---

**Дата создания:** 2025-11-11
**Версия:** 2.0.0
**Автор:** Dmitry (Tech Lead)


---

# TESTING

**Файл:** TESTING.md

# Тестирование

Backend:
- Unit (pytest): detector, endpoints
- Интеграция: Google API mock/fallback
- Покрытие: 80%+

Frontend:
- E2E (Playwright): проверка потока / → POST → /report/[id]

Нагрузка:
- Locust: 100+ одновременных пользователей


---


