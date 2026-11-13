from datetime import datetime, timedelta

from fastapi import (
    FastAPI,
    Depends,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from sqlalchemy.orm import Session

from passlib.context import CryptContext

from jose import JWTError, jwt

from ml.classifier import predict_category

import models
import schemas

from database import (
    engine,
    Base,
    get_db
)


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="AI Finance Assistant API",
    description="AI-powered personal finance management API",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# PASSWORD + JWT SETTINGS
# =========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = "ai-finance-assistant-secret-key"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


security = HTTPBearer()


# =========================================================
# PASSWORD FUNCTIONS
# =========================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# =========================================================
# JWT FUNCTIONS
# =========================================================

def create_access_token(
    user_id: int
) -> str:

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# =========================================================
# CURRENT USER
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid or expired authentication token"
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:

        raise credentials_exception

    user = db.query(
        models.User
    ).filter(
        models.User.id == int(user_id)
    ).first()

    if user is None:
        raise credentials_exception

    return user


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "AI Finance Assistant API is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health_check():

    return {
        "status": "ok",
        "message": "Backend is working"
    }


# =========================================================
# REGISTER
# =========================================================

@app.post("/api/register")
def register(
    user: schemas.UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(
        models.User
    ).filter(
        models.User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(
            user.password
        )
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "user_id": new_user.id
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/api/login")
def login(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(
        models.User
    ).filter(
        models.User.email == user.email
    ).first()

    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_valid = verify_password(
        user.password,
        existing_user.password_hash
    )

    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        existing_user.id
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email
    }


# =========================================================
# CURRENT USER
# =========================================================

@app.get("/api/me")
def get_me(
    current_user: models.User = Depends(
        get_current_user
    )
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }


# =========================================================
# CREATE TRANSACTION
# =========================================================

@app.post("/api/transactions")
def create_transaction(
    transaction: schemas.TransactionCreate,
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    category = transaction.category

    if not category:

        category = predict_category(
            transaction.description
        )

    new_transaction = models.Transaction(
        user_id=current_user.id,
        description=transaction.description,
        amount=transaction.amount,
        transaction_type=transaction.transaction_type,
        category=category,
        transaction_date=transaction.transaction_date
    )

    db.add(new_transaction)

    db.commit()

    db.refresh(new_transaction)

    return new_transaction


# =========================================================
# GET TRANSACTIONS
# =========================================================

@app.get("/api/transactions")
def get_transactions(
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    transactions = db.query(
        models.Transaction
    ).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(
        models.Transaction.id.desc()
    ).all()

    return transactions


# =========================================================
# UPDATE TRANSACTION
# =========================================================

@app.put("/api/transactions/{transaction_id}")
def update_transaction(
    transaction_id: int,
    transaction: schemas.TransactionCreate,
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    existing_transaction = db.query(
        models.Transaction
    ).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()

    if not existing_transaction:

        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    category = transaction.category

    if not category:

        category = predict_category(
            transaction.description
        )

    existing_transaction.description = (
        transaction.description
    )

    existing_transaction.amount = (
        transaction.amount
    )

    existing_transaction.transaction_type = (
        transaction.transaction_type
    )

    existing_transaction.category = category

    existing_transaction.transaction_date = (
        transaction.transaction_date
    )

    db.commit()

    db.refresh(existing_transaction)

    return existing_transaction


# =========================================================
# DELETE TRANSACTION
# =========================================================

@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    transaction = db.query(
        models.Transaction
    ).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()

    if not transaction:

        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    db.delete(transaction)

    db.commit()

    return {
        "message": "Transaction deleted successfully"
    }


# =========================================================
# DASHBOARD
# =========================================================

@app.get("/api/dashboard")
def get_dashboard(
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    transactions = db.query(
        models.Transaction
    ).filter(
        models.Transaction.user_id == current_user.id
    ).all()

    total_income = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "Income"
    )

    total_expenses = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "Expense"
    )

    category_totals = {}

    for transaction in transactions:

        if transaction.transaction_type == "Expense":

            category = transaction.category

            category_totals[category] = (
                category_totals.get(category, 0)
                + transaction.amount
            )

    recent_transactions = sorted(
        transactions,
        key=lambda transaction: transaction.id,
        reverse=True
    )[:5]

    recent_transactions_data = []

    for transaction in recent_transactions:

        recent_transactions_data.append({
            "id": transaction.id,
            "description": transaction.description,
            "amount": transaction.amount,
            "transaction_type": transaction.transaction_type,
            "category": transaction.category,
            "transaction_date": transaction.transaction_date
        })

    return {

        "total_income": round(
            total_income,
            2
        ),

        "total_expenses": round(
            total_expenses,
            2
        ),

        "balance": round(
            total_income - total_expenses,
            2
        ),

        "transaction_count": len(
            transactions
        ),

        "category_totals": {
            category: round(
                amount,
                2
            )
            for category, amount
            in category_totals.items()
        },

        "recent_transactions":
            recent_transactions_data
    }


# =========================================================
# ANALYTICS
# =========================================================

@app.get("/api/analytics")
def get_analytics(
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    transactions = db.query(
        models.Transaction
    ).filter(
        models.Transaction.user_id == current_user.id
    ).all()

    total_income = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "Income"
    )

    total_expenses = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "Expense"
    )

    expense_transactions = [
        transaction
        for transaction in transactions
        if transaction.transaction_type == "Expense"
    ]

    if expense_transactions:

        average_expense = (
            total_expenses /
            len(expense_transactions)
        )

    else:

        average_expense = 0

    category_totals = {}

    for transaction in expense_transactions:

        category = transaction.category

        category_totals[category] = (
            category_totals.get(category, 0)
            + transaction.amount
        )

    monthly_totals = {}

    for transaction in expense_transactions:

        month = transaction.transaction_date[:7]

        monthly_totals[month] = (
            monthly_totals.get(month, 0)
            + transaction.amount
        )

    monthly_expenses = []

    for month, amount in sorted(
        monthly_totals.items()
    ):

        monthly_expenses.append({
            "month": month,
            "amount": round(
                amount,
                2
            )
        })

    return {

        "total_income": round(
            total_income,
            2
        ),

        "total_expenses": round(
            total_expenses,
            2
        ),

        "average_expense": round(
            average_expense,
            2
        ),

        "transaction_count": len(
            transactions
        ),

        "category_totals": {
            category: round(
                amount,
                2
            )
            for category, amount
            in category_totals.items()
        },

        "monthly_expenses":
            monthly_expenses
    }


# =========================================================
# BUDGET - CREATE
# =========================================================

@app.post("/api/budgets")
def create_budget(
    budget: schemas.BudgetCreate,
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    new_budget = models.Budget(
        user_id=current_user.id,
        category=budget.category,
        amount=budget.amount,
        month=budget.month
    )

    db.add(new_budget)

    db.commit()

    db.refresh(new_budget)

    return new_budget


# =========================================================
# BUDGET - GET
# =========================================================

@app.get("/api/budgets")
def get_budgets(
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    budgets = db.query(
        models.Budget
    ).filter(
        models.Budget.user_id == current_user.id
    ).all()

    result = []

    for budget in budgets:

        spent = 0

        transactions = db.query(
            models.Transaction
        ).filter(
            models.Transaction.user_id ==
            current_user.id,
            models.Transaction.transaction_type ==
            "Expense"
        ).all()

        for transaction in transactions:

            transaction_month = (
                transaction.transaction_date[:7]
            )

            if (
                transaction.category ==
                budget.category
                and
                transaction_month ==
                budget.month
            ):

                spent += transaction.amount

        remaining = (
            budget.amount - spent
        )

        percentage = (
            (spent / budget.amount) * 100
            if budget.amount > 0
            else 0
        )

        result.append({

            "id": budget.id,

            "category":
                budget.category,

            "amount":
                round(
                    budget.amount,
                    2
                ),

            "month":
                budget.month,

            "spent":
                round(
                    spent,
                    2
                ),

            "remaining":
                round(
                    remaining,
                    2
                ),

            "percentage":
                round(
                    percentage,
                    2
                )
        })

    return result


# =========================================================
# BUDGET - DELETE
# =========================================================

@app.delete("/api/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    budget = db.query(
        models.Budget
    ).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()

    if not budget:

        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    db.delete(budget)

    db.commit()

    return {
        "message": "Budget deleted successfully"
    }


# =========================================================
# SPENDING PREDICTION
# =========================================================

@app.get("/api/prediction")
def get_prediction(
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    transactions = db.query(
        models.Transaction
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == "Expense"
    ).all()

    if not transactions:

        return {
            "has_data": False,
            "message":
                "Add some expenses to generate a spending prediction.",
            "predicted_monthly_expense": 0,
            "average_monthly_expense": 0,
            "months_analyzed": 0
        }

    monthly_expenses = {}

    for transaction in transactions:

        month = transaction.transaction_date[:7]

        monthly_expenses[month] = (
            monthly_expenses.get(month, 0)
            + transaction.amount
        )

    sorted_months = sorted(
        monthly_expenses.items()
    )

    total_spending = sum(
        amount
        for _, amount
        in sorted_months
    )

    months_analyzed = len(
        sorted_months
    )

    average_monthly_expense = (
        total_spending /
        months_analyzed
    )

    predicted_monthly_expense = (
        average_monthly_expense
    )

    highest_month = max(
        sorted_months,
        key=lambda item: item[1]
    )

    lowest_month = min(
        sorted_months,
        key=lambda item: item[1]
    )

    latest_month = sorted_months[-1][0]

    return {

        "has_data": True,

        "predicted_monthly_expense":
            round(
                predicted_monthly_expense,
                2
            ),

        "average_monthly_expense":
            round(
                average_monthly_expense,
                2
            ),

        "total_spending":
            round(
                total_spending,
                2
            ),

        "months_analyzed":
            months_analyzed,

        "latest_month":
            latest_month,

        "highest_spending_month": {
            "month":
                highest_month[0],
            "amount":
                round(
                    highest_month[1],
                    2
                )
        },

        "lowest_spending_month": {
            "month":
                lowest_month[0],
            "amount":
                round(
                    lowest_month[1],
                    2
                )
        },

        "monthly_expenses": [
            {
                "month": month,
                "amount":
                    round(
                        amount,
                        2
                    )
            }
            for month, amount
            in sorted_months
        ]
    }


# =========================================================
# AI FINANCIAL INSIGHTS
# =========================================================

@app.get("/api/insights")
def get_financial_insights(
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    transactions = db.query(
        models.Transaction
    ).filter(
        models.Transaction.user_id == current_user.id
    ).all()

    if not transactions:

        return {
            "has_data": False,
            "insights": []
        }

    income = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "Income"
    )

    expenses = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "Expense"
    )

    balance = income - expenses

    category_totals = {}

    for transaction in transactions:

        if transaction.transaction_type == "Expense":

            category = transaction.category

            category_totals[category] = (
                category_totals.get(category, 0)
                + transaction.amount
            )

    insights = []

    # -----------------------------------------------------
    # HIGHEST SPENDING CATEGORY
    # -----------------------------------------------------

    if category_totals:

        highest_category = max(
            category_totals,
            key=category_totals.get
        )

        highest_amount = category_totals[
            highest_category
        ]

        percentage = (
            highest_amount / expenses * 100
            if expenses > 0
            else 0
        )

        insights.append({

            "type": "warning",

            "title":
                "Highest Spending Category",

            "message":
                (
                    f"{highest_category} is your highest "
                    f"spending category at "
                    f"₹{highest_amount:.2f}, which is "
                    f"{percentage:.1f}% of your total "
                    f"expenses."
                )
        })

    # -----------------------------------------------------
    # BALANCE
    # -----------------------------------------------------

    if balance > 0:

        savings_percentage = (
            balance / income * 100
            if income > 0
            else 0
        )

        insights.append({

            "type": "success",

            "title":
                "Positive Balance",

            "message":
                (
                    f"You currently have a positive "
                    f"balance of ₹{balance:.2f}. "
                    f"Your remaining amount is "
                    f"approximately "
                    f"{savings_percentage:.1f}% "
                    f"of your income."
                )
        })

    elif balance < 0:

        insights.append({

            "type": "danger",

            "title":
                "Expenses Exceed Income",

            "message":
                (
                    f"Your expenses are "
                    f"₹{abs(balance):.2f} higher "
                    f"than your recorded income. "
                    f"Consider reducing "
                    f"non-essential spending."
                )
        })

    else:

        insights.append({

            "type": "warning",

            "title":
                "No Remaining Balance",

            "message":
                (
                    "Your recorded income and "
                    "expenses are currently equal."
                )
        })

    # -----------------------------------------------------
    # SPENDING RATIO
    # -----------------------------------------------------

    if income > 0:

        expense_ratio = (
            expenses / income * 100
        )

        if expense_ratio >= 90:

            insights.append({

                "type": "danger",

                "title":
                    "High Spending Level",

                "message":
                    (
                        f"You have spent "
                        f"{expense_ratio:.1f}% "
                        f"of your recorded income."
                    )
            })

        elif expense_ratio >= 70:

            insights.append({

                "type": "warning",

                "title":
                    "Watch Your Spending",

                "message":
                    (
                        f"Your expenses are "
                        f"{expense_ratio:.1f}% "
                        f"of your recorded income. "
                        f"Consider reviewing your "
                        f"discretionary expenses."
                    )
            })

        else:

            insights.append({

                "type": "success",

                "title":
                    "Spending Under Control",

                "message":
                    (
                        f"Your expenses are "
                        f"{expense_ratio:.1f}% "
                        f"of your recorded income."
                    )
            })

    # -----------------------------------------------------
    # AVERAGE EXPENSE
    # -----------------------------------------------------

    expense_transactions = [

        transaction
        for transaction in transactions
        if transaction.transaction_type ==
        "Expense"

    ]

    if expense_transactions:

        average_expense = (
            expenses /
            len(expense_transactions)
        )

        insights.append({

            "type": "info",

            "title":
                "Average Transaction",

            "message":
                (
                    f"Your average expense "
                    f"transaction is "
                    f"₹{average_expense:.2f}."
                )
        })

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "has_data": True,

        "summary": {

            "income":
                round(
                    income,
                    2
                ),

            "expenses":
                round(
                    expenses,
                    2
                ),

            "balance":
                round(
                    balance,
                    2
                )
        },

        "category_totals": {

            category:
                round(
                    amount,
                    2
                )

            for category, amount
            in category_totals.items()
        },

        "insights":
            insights
    }
# =========================================================
# FINANCE CHATBOT
# =========================================================

@app.post("/api/chat")
def finance_chat(
    chat: schemas.ChatRequest,
    current_user: models.User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    question = chat.message.lower().strip()

    transactions = db.query(
        models.Transaction
    ).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(
        models.Transaction.id.desc()
    ).all()

    if not transactions:

        return {
            "reply":
                "You don't have any transactions yet. Add some income or expenses first."
        }

    total_income = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "Income"
    )

    total_expenses = sum(
        transaction.amount
        for transaction in transactions
        if transaction.transaction_type == "Expense"
    )

    balance = (
        total_income -
        total_expenses
    )

    # -----------------------------------------------------
    # TOTAL EXPENSES
    # -----------------------------------------------------

    if (
        "how much did i spend" in question
        or "total expense" in question
        or "total expenses" in question
        or "how much have i spent" in question
    ):

        return {
            "reply":
                f"Your total recorded expenses are ₹{total_expenses:.2f}."
        }

    # -----------------------------------------------------
    # TOTAL INCOME
    # -----------------------------------------------------

    if (
        "how much did i earn" in question
        or "total income" in question
        or "my income" in question
        or "how much income" in question
    ):

        return {
            "reply":
                f"Your total recorded income is ₹{total_income:.2f}."
        }

    # -----------------------------------------------------
    # BALANCE
    # -----------------------------------------------------

    if (
        "my balance" in question
        or "current balance" in question
        or "how much money do i have" in question
        or "money left" in question
    ):

        return {
            "reply":
                f"Your current balance is ₹{balance:.2f}."
        }

    # -----------------------------------------------------
    # HIGHEST CATEGORY
    # -----------------------------------------------------

    if (
        "highest spending category" in question
        or "most money" in question
        or "spend the most" in question
        or "highest category" in question
    ):

        category_totals = {}

        for transaction in transactions:

            if transaction.transaction_type == "Expense":

                category = transaction.category

                category_totals[category] = (
                    category_totals.get(
                        category,
                        0
                    )
                    + transaction.amount
                )

        if not category_totals:

            return {
                "reply":
                    "You don't have any expense transactions yet."
            }

        highest_category = max(
            category_totals,
            key=category_totals.get
        )

        highest_amount = (
            category_totals[
                highest_category
            ]
        )

        return {
            "reply":
                (
                    f"Your highest spending category "
                    f"is {highest_category}, with "
                    f"₹{highest_amount:.2f} spent."
                )
        }

    # -----------------------------------------------------
    # RECENT TRANSACTIONS
    # -----------------------------------------------------

    if (
        "recent transactions" in question
        or "recent spending" in question
        or "latest transactions" in question
    ):

        recent = transactions[:5]

        lines = []

        for transaction in recent:

            lines.append(
                (
                    f"{transaction.description} — "
                    f"₹{transaction.amount:.2f} — "
                    f"{transaction.category} — "
                    f"{transaction.transaction_type}"
                )
            )

        return {
            "reply":
                "Here are your recent transactions:\n\n"
                + "\n".join(lines)
        }

    # -----------------------------------------------------
    # EXPENSE CATEGORY
    # -----------------------------------------------------

    category_names = [
        "food",
        "transport",
        "shopping",
        "bills",
        "entertainment",
        "health"
    ]

    for category_name in category_names:

        if category_name in question:

            category_total = sum(
                transaction.amount
                for transaction in transactions
                if (
                    transaction.transaction_type ==
                    "Expense"
                    and
                    transaction.category.lower() ==
                    category_name
                )
            )

            return {
                "reply":
                    (
                        f"You have spent "
                        f"₹{category_total:.2f} "
                        f"on {category_name.title()}."
                    )
            }

    # -----------------------------------------------------
    # GENERAL HELP
    # -----------------------------------------------------

    if (
        "help" in question
        or "what can you do" in question
    ):

        return {
            "reply":
                (
                    "I can help you check your "
                    "total income, expenses, balance, "
                    "highest spending category, "
                    "recent transactions, and "
                    "category-wise spending."
                )
        }

    # -----------------------------------------------------
    # DEFAULT RESPONSE
    # -----------------------------------------------------

    return {
        "reply":
            (
                "I can answer questions about your "
                "income, expenses, balance, spending "
                "categories, and recent transactions. "
                "Try asking: 'How much did I spend?'"
            )
    }