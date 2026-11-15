from typing import List, Dict, Any
from app.models.transaction import Transaction


def calculate_prediction_data(transactions: List[Transaction]) -> Dict[str, Any]:
    expense_transactions = [
        t for t in transactions if t.transaction_type == "Expense"
    ]

    if not expense_transactions:
        return {
            "has_data": False,
            "message": "Add some expenses to generate a spending prediction.",
            "predicted_monthly_expense": 0.0,
            "average_monthly_expense": 0.0,
            "months_analyzed": 0,
        }

    monthly_expenses: Dict[str, float] = {}
    for t in expense_transactions:
        month = (t.transaction_date or "")[:7]
        if month:
            monthly_expenses[month] = monthly_expenses.get(month, 0.0) + t.amount

    if not monthly_expenses:
        return {
            "has_data": False,
            "message": "No valid dated expenses found to generate predictions.",
            "predicted_monthly_expense": 0.0,
            "average_monthly_expense": 0.0,
            "months_analyzed": 0,
        }

    sorted_months = sorted(monthly_expenses.items())
    total_spending = sum(amt for _, amt in sorted_months)
    months_analyzed = len(sorted_months)
    average_monthly_expense = total_spending / months_analyzed

    # Weighted moving average if multiple months exist
    if months_analyzed >= 3:
        recent_weights = [0.2, 0.3, 0.5]
        last_3 = [amt for _, amt in sorted_months[-3:]]
        predicted_monthly_expense = sum(w * a for w, a in zip(recent_weights, last_3))
    else:
        predicted_monthly_expense = average_monthly_expense

    highest_month = max(sorted_months, key=lambda item: item[1])
    lowest_month = min(sorted_months, key=lambda item: item[1])
    latest_month = sorted_months[-1][0]

    return {
        "has_data": True,
        "predicted_monthly_expense": round(predicted_monthly_expense, 2),
        "average_monthly_expense": round(average_monthly_expense, 2),
        "total_spending": round(total_spending, 2),
        "months_analyzed": months_analyzed,
        "latest_month": latest_month,
        "highest_spending_month": {
            "month": highest_month[0],
            "amount": round(highest_month[1], 2),
        },
        "lowest_spending_month": {
            "month": lowest_month[0],
            "amount": round(lowest_month[1], 2),
        },
        "monthly_expenses": [
            {"month": m, "amount": round(amt, 2)}
            for m, amt in sorted_months
        ],
    }
