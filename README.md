# 💰 Smart Expense Tracker with AI Insights

A full-stack expense tracking application with AI-powered categorization, OCR bill scanning, savings suggestions, and spending predictions.

[![Made with React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react)](https://react.dev)
[![Made with Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI_GPT--3.5-412991?logo=openai)](https://openai.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT-based signup/login with protected routes |
| 💳 Expense Management | Add, edit, delete income & expenses with categories |
| 🤖 AI Categorization | Auto-categorize expenses using OpenAI (Swiggy → Food, Uber → Travel) |
| 📸 OCR Bill Scanner | Upload bill images → Tesseract OCR → AI extracts amount & merchant |
| 📊 Analytics Dashboard | Bar charts (6-month trend) + Pie charts (category breakdown) |
| 💡 AI Savings Tips | OpenAI generates personalized savings suggestions |
| 🔮 Expense Prediction | Predict next month's spending using historical data |
| 📱 Bank SMS Parser | Parse bank SMS messages to extract transactions |
| 🌙 Dark Mode | Full dark mode support |
| 📱 Responsive | Mobile-first design with Tailwind CSS |

---

## 🛠️ Tech Stack

**Frontend:** React.js, Tailwind CSS, Chart.js, React Router, Axios  
**Backend:** Node.js, Express.js, Mongoose  
**Database:** MongoDB Atlas  
**AI/OCR:** OpenAI GPT-3.5 Turbo, Tesseract.js  
**Auth:** JWT (JSON Web Tokens), bcrypt  
**Deployment:** Vercel (Frontend), Render (Backend), MongoDB Atlas (DB)

---

## 📁 Folder Structure

```
Smart Expense Tracker/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Login, register logic
│   │   ├── expenseController.js    # CRUD expense logic
│   │   ├── analyticsController.js  # Chart data logic
│   │   └── aiController.js         # OpenAI integrations
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   └── Expense.js              # Expense schema
│   ├── routes/
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── expenses.js             # /api/expenses/*
│   │   ├── analytics.js            # /api/analytics/*
│   │   ├── ai.js                   # /api/ai/*
│   │   ├── ocr.js                  # /api/ocr/*
│   │   └── sms.js                  # /api/sms/*
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT protection
│   ├── uploads/                    # Bill images (gitignored)
│   ├── server.js                   # Express entry point
│   ├── .env                        # Environment variables (gitignored)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       └── Layout.jsx      # Sidebar + header shell
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ExpensesPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── AIInsightsPage.jsx
│   │   │   ├── OCRScannerPage.jsx
│   │   │   ├── SMSParserPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state
│   │   ├── utils/
│   │   │   └── api.js              # Axios instance + interceptors
│   │   ├── App.jsx                 # Router setup
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Tailwind + global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18 or higher
- npm v8 or higher
- MongoDB Atlas account (free tier works)
- OpenAI API key

### Step 1 — Clone the project
```bash
cd ~/Desktop
git clone <your-repo-url> "Smart Expense Tracker"
cd "Smart Expense Tracker"
```

### Step 2 — Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Now edit .env with your actual values (see below)
```

**Edit `backend/.env`:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-expense-tracker
JWT_SECRET=your_long_random_secret_key_here
OPENAI_API_KEY=sk-your-openai-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_SECURE=false
EMAIL_FROM="Smart Expense Tracker <no-reply@smartexpensetracker.com>"
```

```bash
npm run dev   # Starts backend on http://localhost:5000
```

### Step 3 — Frontend Setup
```bash
# Open a new terminal tab
cd frontend
npm install
npm run dev   # Starts frontend on http://localhost:5173
```

### Step 4 — Open the app
Visit **http://localhost:5173** and register a new account!

---

## 🌍 Deployment

### MongoDB Atlas
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Get your connection string → paste into `MONGO_URI`
5. Add `0.0.0.0/0` to Network Access (allow all IPs)

### Backend → Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add all environment variables from `.env`
6. Deploy!

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → Import Project
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
5. Update `vite.config.js` proxy target to your Render URL
6. Deploy!

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List expenses (with filters) |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/summary` | Monthly totals |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/monthly` | 6-month income vs expense |
| GET | `/api/analytics/categories` | Category breakdown |
| GET | `/api/analytics/top-spending` | Top 5 expenses |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/categorize` | Auto-categorize an expense |
| GET | `/api/ai/insights` | Get savings suggestions |
| GET | `/api/ai/predict` | Predict next month's expenses |

### OCR & SMS
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ocr/scan` | Upload bill image → extract data |
| POST | `/api/sms/parse` | Parse bank SMS text |
| GET | `/api/sms/samples` | Get demo SMS messages |

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `ECONNREFUSED` on backend start | Check MongoDB URI is correct in .env |
| `401 Unauthorized` on API calls | Token expired — log out and log in again |
| OCR is slow | Normal — Tesseract takes 10-30 seconds for first scan |
| `OpenAI API key invalid` | Get a key from platform.openai.com — ensure you have credits |
| CORS error in browser | Check `FRONTEND_URL` in backend .env matches your frontend URL |
| Vite proxy not working | Make sure backend is running on port 5000 |

---

## 👨‍💻 Author

Built as a full-stack portfolio project demonstrating:
- REST API design with Express.js
- MongoDB schema design and aggregation pipelines
- JWT authentication with bcrypt
- OpenAI API integration
- Tesseract.js OCR
- React Context API for global state
- Chart.js for data visualization
- Tailwind CSS responsive design
- Deployment to Vercel + Render

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.
