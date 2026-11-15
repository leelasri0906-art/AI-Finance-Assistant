from typing import List, Dict, Any
from app.models.transaction import Transaction


def calculate_dashboard_data(transactions: List[Transaction]) -> Dict[str, Any]:
    total_income = sum(
        t.amount for t in transactions if t.transaction_type == "Income"
    )
    total_expenses = sum(
        t.amount for t in transactions if t.transaction_type == "Expense"
    )

    category_totals: Dict[str, float] = {}
    for t in transactions:
        if t.transaction_type == "Expense":
            category = t.category or "Other"
            category_totals[category] = category_totals.get(category, 0.0) + t.amount

    recent_transactions = sorted(
        transactions,
        key=lambda t: (t.transaction_date or "", t.id or 0),
        reverse=True
    )[:5]

    recent_data = [
        {
            "id": t.id,
            "description": t.description,
            "amount": round(t.amount, 2),
            "transaction_type": t.transaction_type,
            "category": t.category,
            "transaction_date": t.transaction_date,
        }
        for t in recent_transactions
    ]

    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "balance": round(total_income - total_expenses, 2),
        "transaction_count": len(transactions),
        "category_totals": {
            cat: round(amt, 2) for cat, amt in category_totals.items()
        },
        "recent_transactions": recent_data,
    }


def calculate_analytics_data(transactions: List[Transaction]) -> Dict[str, Any]:
    total_income = sum(
        t.amount for t in transactions if t.transaction_type == "Income"
    )
    total_expenses = sum(
        t.amount for t in transactions if t.transaction_type == "Expense"
    )

    expense_transactions = [
        t for t in transactions if t.transaction_type == "Expense"
    ]
    average_expense = (
        total_expenses / len(expense_transactions)
        if expense_transactions
        else 0.0
    )

    category_totals: Dict[str, float] = {}
    for t in expense_transactions:
        cat = t.category or "Other"
        category_totals[cat] = category_totals.get(cat, 0.0) + t.amount

    monthly_totals: Dict[str, float] = {}
    for t in expense_transactions:
        month = (t.transaction_date or "")[:7]
        if month:
            monthly_totals[month] = monthly_totals.get(month, 0.0) + t.amount

    monthly_expenses = [
        {"month": month, "amount": round(amt, 2)}
        for month, amt in sorted(monthly_totals.items())
    ]

    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "average_expense": round(average_expense, 2),
        "transaction_count": len(transactions),
        "category_totals": {
            cat: round(amt, 2) for cat, amt in category_totals.items()
        },
        "monthly_expenses": monthly_expenses,
    }
