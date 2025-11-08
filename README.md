# Antiplagiat - Production Platform

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

## 🚀 Quick Deploy

1. Fork этот репозиторий
2. Создайте аккаунт на [Render.com](https://render.com)
3. Нажмите "New" → "Blueprint"
4. Подключите GitHub и выберите этот репозиторий
5. Render автоматически создаст:
   - Frontend (Next.js)
   - Backend API (FastAPI)
   - PostgreSQL Database

## 📊 Services

- **Frontend**: Next.js 14 (Static Site)
- **API**: Python FastAPI
- **Database**: PostgreSQL (Free tier)

## 🌐 Live Demo

- Frontend: https://antiplagiat-frontend.onrender.com
- API: https://antiplagiat-api.onrender.com/docs

## 🛠️ Local Development

\\\ash
# Install dependencies
npm install --prefix frontend
pip install -r backend/public-api/requirements.txt

# Run locally
npm run dev --prefix frontend
python backend/public-api/app/main.py
\\\

## 📝 Environment Variables

Render автоматически настроит:
- \DATABASE_URL\ - PostgreSQL connection
- \NEXT_PUBLIC_API_URL\ - API endpoint
- \PORT\ - Service port

## 🔒 Security

- HTTPS by default
- Environment variables encrypted
- Automatic SSL certificates

## 📄 License

MIT License
