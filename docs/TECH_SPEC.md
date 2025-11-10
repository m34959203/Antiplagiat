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
