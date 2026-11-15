from typing import List, Dict, Any
from app.models.transaction import Transaction


def generate_financial_insights(transactions: List[Transaction]) -> Dict[str, Any]:
    if not transactions:
        return {
            "has_data": False,
            "insights": [],
            "summary": {"income": 0.0, "expenses": 0.0, "balance": 0.0},
            "category_totals": {},
        }

    income = sum(t.amount for t in transactions if t.transaction_type == "Income")
    expenses = sum(t.amount for t in transactions if t.transaction_type == "Expense")
    balance = income - expenses

    category_totals: Dict[str, float] = {}
    expense_transactions = []
    for t in transactions:
        if t.transaction_type == "Expense":
            expense_transactions.append(t)
            cat = t.category or "Other"
            category_totals[cat] = category_totals.get(cat, 0.0) + t.amount

    insights = []

    # 1. Highest Spending Category
    if category_totals:
        highest_category = max(category_totals, key=category_totals.get)
        highest_amount = category_totals[highest_category]
        percentage = (highest_amount / expenses * 100) if expenses > 0 else 0.0

        insights.append({
            "type": "warning",
            "title": "Highest Spending Category",
            "message": (
                f"{highest_category} is your highest spending category at "
                f"₹{highest_amount:.2f}, representing {percentage:.1f}% of total expenses."
            ),
        })

    # 2. Balance & Savings Ratio
    if balance > 0:
        savings_percentage = (balance / income * 100) if income > 0 else 0.0
        insights.append({
            "type": "success",
            "title": "Healthy Positive Balance",
            "message": (
                f"You currently have a surplus of ₹{balance:.2f}. "
                f"You saved approximately {savings_percentage:.1f}% of your recorded income."
            ),
        })
    elif balance < 0:
        insights.append({
            "type": "danger",
            "title": "Expenses Exceed Income",
            "message": (
                f"Your expenses are ₹{abs(balance):.2f} higher than your recorded income. "
                "Consider setting monthly category budgets to curtail discretionary spending."
            ),
        })
    else:
        insights.append({
            "type": "warning",
            "title": "Zero Net Balance",
            "message": "Your recorded income and expenses are equal. Aim to build a 20% emergency savings buffer.",
        })

    # 3. Spending Ratio Assessment
    if income > 0:
        expense_ratio = (expenses / income * 100)
        if expense_ratio >= 90:
            insights.append({
                "type": "danger",
                "title": "Critical Spending Level",
                "message": f"You have spent {expense_ratio:.1f}% of your income. High risk of overshooting.",
            })
        elif expense_ratio >= 70:
            insights.append({
                "type": "warning",
                "title": "Moderate Spending Level",
                "message": f"Your spending is at {expense_ratio:.1f}% of income. Keep discretionary costs in check.",
            })
        else:
            insights.append({
                "type": "success",
                "title": "Excellent Financial Discipline",
                "message": f"Your spending is well-controlled at only {expense_ratio:.1f}% of income.",
            })

    # 4. Average Expense Transaction
    if expense_transactions:
        avg_expense = expenses / len(expense_transactions)
        insights.append({
            "type": "info",
            "title": "Average Transaction Size",
            "message": f"Your average expense transaction is ₹{avg_expense:.2f} across {len(expense_transactions)} purchases.",
        })

    return {
        "has_data": True,
        "summary": {
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "balance": round(balance, 2),
        },
        "category_totals": {
            cat: round(amt, 2) for cat, amt in category_totals.items()
        },
        "insights": insights,
    }
