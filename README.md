# AI Finance Assistant 💸🤖

An intelligent, full-stack personal finance management platform powered by **FastAPI**, **React (Vite)**, **Supabase PostgreSQL**, and **Machine Learning** for automated expense classification and spending forecasts.

---

## 🌟 Key Features

- **🔐 Robust Authentication & Security**: Secure user registration and login using industry-standard `bcrypt` password hashing and stateless `JWT (HS256)` bearer authentication tokens. Multi-tenant database isolation ensures each user only accesses their own financial data.
- **⚡ Real-Time Financial Dashboard**: Visual analytics for total balance, total income, total expenditures, monthly category breakdown, and recent transactions.
- **🤖 AI-Driven Auto-Categorization**: Natural Language / Machine Learning model (TF-IDF + Logistic Regression) trained on financial transactions to auto-classify expense descriptions (Food, Transport, Bills, Shopping, Entertainment, Health, Income) with intelligent keyword-matching fallback.
- **📊 Interactive Analytics & Trends**: Month-over-month spending charts, expense distribution by category, and average transaction sizes.
- **🎯 Dynamic Budget Planner**: Set category spending targets for any month, view real-time consumption progress bars, and receive proactive overspending alerts.
- **🔮 Predictive Spending Forecasting**: Statistical time-series forecasting to predict expected next-month expenditures.
- **💡 AI Financial Insights**: Automated financial health assessment analyzing savings ratios, highest spending categories, and personalized budgeting advice.
- **💬 Conversational Finance Chatbot**: Instant NLP query assistant answering questions about balances, spending, categories, and recent transactions.
- **🐘 Supabase Cloud Integration**: Enterprise-grade PostgreSQL database hosted on Supabase with SSL encryption and automatic connection pooling.

---

## 🏗️ Project Architecture & Directory Structure

```
AI-Finance-Assistant/
├── backend/
│   ├── app/
│   │   ├── api/                   # Modular FastAPI route endpoints
│   │   │   ├── auth.py            # /api/register, /api/login, /api/me
│   │   │   ├── transactions.py    # /api/transactions CRUD & ML categorization
│   │   │   ├── budgets.py         # /api/budgets CRUD & progress calculation
│   │   │   ├── dashboard.py       # /api/dashboard overview metrics
│   │   │   ├── analytics.py       # /api/analytics monthly trends
│   │   │   ├── prediction.py      # /api/prediction forecasting
│   │   │   ├── insights.py        # /api/insights observations
│   │   │   └── chat.py            # /api/chat AI conversational assistant
│   │   ├── core/                  # Core security & authentication
│   │   │   └── security.py        # Bcrypt hashing & JWT token validation
│   │   ├── models/                # SQLAlchemy database models
│   │   │   ├── user.py            # Users table schema
│   │   │   ├── transaction.py     # Transactions table schema
│   │   │   └── budget.py          # Budgets table schema
│   │   ├── schemas/               # Pydantic request & response schemas
│   │   │   ├── user.py
│   │   │   ├── transaction.py
│   │   │   ├── budget.py
│   │   │   └── chat.py
│   │   ├── services/              # Business logic & ML pipelines
│   │   │   ├── ml_classifier.py   # Category prediction service
│   │   │   ├── analytics_service.py
│   │   │   ├── prediction_service.py
│   │   │   ├── insights_service.py
│   │   │   └── chatbot_service.py
│   │   ├── config.py              # Environment configuration & Supabase settings
│   │   ├── database.py            # SQLAlchemy engine & session lifecycle
│   │   └── main.py                # FastAPI application instance & CORS middleware
│   ├── ml/
│   │   ├── expense_dataset.csv    # Training corpus of financial transactions
│   │   ├── expense_model.pkl      # Pretrained Scikit-Learn pipeline
│   │   ├── train_model.py         # Script to retrain classifier
│   │   └── test_model.py          # Model verification test script
│   ├── tests/
│   │   └── test_api.py            # End-to-end integration test suite
│   ├── .env.example               # Template environment variables
│   ├── main.py                    # Server entrypoint
│   ├── Procfile                   # Cloud web process definition
│   └── requirements.txt           # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI elements
│   │   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   │   ├── Topbar.jsx         # Header with user profile & search
│   │   │   └── StatCard.jsx       # Metric summary card
│   │   ├── pages/                 # Application views
│   │   │   ├── Login.jsx          # User sign-in
│   │   │   ├── Register.jsx       # User registration
│   │   │   ├── Dashboard.jsx      # Main overview dashboard
│   │   │   ├── Transactions.jsx   # Transaction management & auto-tagging
│   │   │   ├── Budget.jsx         # Monthly budget tracking
│   │   │   ├── Analytics.jsx      # Expense trends & visual charts
│   │   │   ├── Prediction.jsx     # Spending forecast view
│   │   │   ├── AIInsights.jsx     # Automated financial observations
│   │   │   └── Chatbot.jsx        # AI financial conversation
│   │   ├── services/
│   │   │   └── api.js             # Centralized Axios client & interceptors
│   │   ├── utils/
│   │   │   └── formatters.js      # Currency & date formatting helpers
│   │   ├── styles/
│   │   │   └── dashboard.css      # Dark glassmorphic responsive styles
│   │   ├── App.jsx                # Root application component
│   │   ├── index.css              # Global styles & design tokens
│   │   └── main.jsx               # React DOM entrypoint
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── render.yaml                    # One-click Render deployment blueprint
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm
- A **Supabase PostgreSQL** database (or SQLite for local offline testing)

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and configure your Supabase credentials
cp .env.example .env

# Run unit & integration tests
python -c "import sys; sys.path.insert(0, '.'); import tests.test_api as t; t.setup_module(); t.test_health_check(); t.test_auth_and_user_flow(); t.teardown_module(); print('Tests passed!')"

# Start development server
python main.py
# Server will run at http://127.0.0.1:8000
# Interactive API Documentation: http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run ESLint check
npm run lint

# Start development server
npm run dev
# Web app will be accessible at http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL Connection String | Supabase instance |
| `SECRET_KEY` | JWT secret signature key | Configured key |
| `ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifespan | `1440` (24 hours) |
| `PORT` | Web server listening port | `8000` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://127.0.0.1:8000` |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/health` | Health check & database status | No |
| `POST` | `/api/register` | Register new user account | No |
| `POST` | `/api/login` | Authenticate user & return JWT | No |
| `GET` | `/api/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/transactions` | Retrieve current user's transactions | Yes |
| `POST` | `/api/transactions` | Create transaction (with AI category prediction) | Yes |
| `PUT` | `/api/transactions/{id}` | Update existing transaction | Yes |
| `DELETE` | `/api/transactions/{id}` | Delete transaction | Yes |
| `GET` | `/api/budgets` | Fetch monthly budgets & spending progress | Yes |
| `POST` | `/api/budgets` | Create or update budget limit | Yes |
| `DELETE` | `/api/budgets/{id}` | Remove budget limit | Yes |
| `GET` | `/api/dashboard` | Aggregated dashboard overview metrics | Yes |
| `GET` | `/api/analytics` | Category breakdown & monthly trends | Yes |
| `GET` | `/api/prediction` | Next-month predictive expenditure forecast | Yes |
| `GET` | `/api/insights` | Automated spending insights & health advice | Yes |
| `POST` | `/api/chat` | AI conversational financial chatbot | Yes |

---

## ☁️ Deployment

The project includes a ready-to-deploy `render.yaml` specification supporting both the FastAPI backend service and Vite frontend static site.

1. Connect your GitHub repository to [Render](https://render.com/).
2. Select **Blueprints** and choose this repository.
3. Supply `DATABASE_URL` and `SECRET_KEY` in the environment settings.
4. Deploy!
