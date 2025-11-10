# 🔍 Antiplagiat - AI-Powered Plagiarism Detection

[![Production](https://img.shields.io/badge/Production-Live-brightgreen)](https://antiplagiat-frontend.onrender.com)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)](https://antiplagiat-api.onrender.com)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js-000000)](https://nextjs.org/)

> AI-платформа для проверки текстов на плагиат с использованием Google Search API и Gemini 2.0

---

## 🚀 Quick Start

### Live Demo
- **Frontend:** https://antiplagiat-frontend.onrender.com
- **Backend API:** https://antiplagiat-api.onrender.com/docs

### Local Development

#### Backend
\\\ash
cd backend/public-api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
\\\

#### Frontend
\\\ash
cd frontend
npm install
npm run dev
\\\

---

## ✨ Features

- ⚡ **Fast Mode**: Быстрая эвристическая проверка (~5 сек)
- 🤖 **Deep Mode**: AI + Google Search (~15 сек)
- 🌐 **Multilingual**: Русский, English, Қазақ
- 📊 **Detailed Reports**: % оригинальности, источники, совпадения
- 💾 **History**: Сохранение всех проверок
- 🔒 **Secure**: JWT auth, Rate limiting

---

## 🏗️ Architecture

\\\
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Next.js   │─────▶│   FastAPI   │─────▶│ PostgreSQL  │
│  Frontend   │      │   Backend   │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │Google Search│
                     │   Gemini AI │
                     └─────────────┘
\\\

---

## 📊 Tech Stack

### Backend
- **Framework:** FastAPI 0.109
- **Language:** Python 3.12
- **Database:** PostgreSQL 16
- **Cache:** Redis 7.2
- **AI:** Google Gemini 2.0 (via OpenRouter)
- **Search:** Google Custom Search API

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.4
- **State:** React Context

### DevOps
- **Hosting:** Render.com
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry
- **Testing:** pytest, Playwright

---

## 🔧 Configuration

### Environment Variables

#### Backend (\.env\)
\\\env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENROUTER_API_KEY=sk-...
GOOGLE_SEARCH_API_KEY=AIza...
GOOGLE_SEARCH_CX=...
JWT_SECRET=...
\\\

#### Frontend (\.env.local\)
\\\env
NEXT_PUBLIC_API_URL=https://antiplagiat-api.onrender.com
\\\

---

## 🧪 Testing

\\\ash
# Backend tests
cd backend/public-api
pytest app/tests/ -v

# Frontend tests (coming soon)
cd frontend
npm test
\\\

---

## 📈 Status

### ✅ Phase 1: Core Functionality (DONE)
- [x] Backend API (FastAPI)
- [x] Frontend (Next.js)
- [x] Google Search integration
- [x] Weighted similarity algorithm
- [x] PostgreSQL database
- [x] Production deployment

### 🚧 Phase 2: User Management (IN PROGRESS)
- [x] History of checks
- [ ] User authentication (JWT)
- [ ] User dashboard
- [ ] Profile management

### 📅 Phase 3: Monetization (PLANNED)
- [ ] Stripe integration
- [ ] Subscription plans
- [ ] B2B API
- [ ] Admin panel

---

## 📝 API Documentation

### Endpoints

#### Health Check
\\\http
GET /health
\\\

#### Create Check
\\\http
POST /api/v1/check
Content-Type: application/json

{
  "text": "Text to check...",
  "mode": "deep",
  "lang": "ru"
}
\\\

#### Get Result
\\\http
GET /api/v1/check/{task_id}
\\\

Full API docs: https://antiplagiat-api.onrender.com/docs

---

## 🤝 Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 📞 Contact

- **GitHub:** https://github.com/m34959203/antiplagiat
- **Issues:** https://github.com/m34959203/antiplagiat/issues

---

**Built with ❤️ using AI assistance**