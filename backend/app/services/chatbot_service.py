from typing import List, Dict
from app.models.transaction import Transaction


def process_finance_chat(question: str, transactions: List[Transaction]) -> str:
    q = (question or "").lower().strip()

    if not transactions:
        return "You don't have any transactions recorded yet. Add some income or expenses to start tracking your finances!"

    total_income = sum(t.amount for t in transactions if t.transaction_type == "Income")
    total_expenses = sum(t.amount for t in transactions if t.transaction_type == "Expense")
    balance = total_income - total_expenses

    category_totals: Dict[str, float] = {}
    for t in transactions:
        if t.transaction_type == "Expense":
            cat = t.category or "Other"
            category_totals[cat] = category_totals.get(cat, 0.0) + t.amount

    # Total Expenses
    if any(phrase in q for phrase in [
        "how much did i spend", "total expense", "total expenses",
        "how much have i spent", "my spending", "total spend"
    ]):
        return f"Your total recorded expenses are ₹{total_expenses:,.2f}."

    # Total Income
    if any(phrase in q for phrase in [
        "how much did i earn", "total income", "my income",
        "how much income", "total earnings", "my salary"
    ]):
        return f"Your total recorded income is ₹{total_income:,.2f}."

    # Balance / Savings
    if any(phrase in q for phrase in [
        "my balance", "current balance", "how much money do i have",
        "money left", "remaining balance", "savings", "how much is left"
    ]):
        status = "surplus" if balance >= 0 else "deficit"
        return f"Your current net balance is ₹{balance:,.2f} ({status})."

    # Highest Spending Category
    if any(phrase in q for phrase in [
        "highest spending category", "most money", "spend the most",
        "highest category", "biggest expense", "top expense"
    ]):
        if not category_totals:
            return "You don't have any expense transactions yet."
        highest_cat = max(category_totals, key=category_totals.get)
        highest_val = category_totals[highest_cat]
        return f"Your highest spending category is {highest_cat}, with ₹{highest_val:,.2f} spent."

    # Recent Transactions
    if any(phrase in q for phrase in [
        "recent transaction", "recent transactions", "recent spending",
        "latest transaction", "latest transactions", "last transaction"
    ]):
        recent = sorted(transactions, key=lambda t: (t.transaction_date or "", t.id or 0), reverse=True)[:5]
        lines = [
            f"• {t.description} — ₹{t.amount:,.2f} ({t.category}, {t.transaction_type}) on {t.transaction_date}"
            for t in recent
        ]
        return "Here are your 5 most recent transactions:\n\n" + "\n".join(lines)

    # Specific Category Query
    known_categories = ["food", "transport", "shopping", "bills", "entertainment", "health"]
    for cat in known_categories:
        if cat in q:
            cat_total = sum(
                t.amount for t in transactions
                if t.transaction_type == "Expense" and (t.category or "").lower() == cat
            )
            return f"You have spent ₹{cat_total:,.2f} on {cat.capitalize()}."

    # Financial Advice / Savings tips
    if any(phrase in q for phrase in ["advice", "tip", "save money", "budgeting", "invest"]):
        if balance > 0:
            return (
                f"Great job maintaining a positive balance of ₹{balance:,.2f}! "
                "Consider the 50/30/20 rule: 50% for needs, 30% for wants, and 20% into savings or mutual funds."
            )
        else:
            return (
                "Your expenses currently exceed your income. "
                "Review your top spending category and set a budget limit to trim non-essential purchases."
            )

    # Help Query
    if any(phrase in q for phrase in ["help", "what can you do", "features", "commands"]):
        return (
            "I can answer questions about your income, total spending, current balance, "
            "highest spending categories, recent activity, and budgeting advice! "
            "Try asking: 'What is my current balance?' or 'How much did I spend on food?'"
        )

    return (
        f"I'm here to help with your finances! Your current balance is ₹{balance:,.2f}. "
        "You can ask me: 'How much did I spend?', 'What are my recent transactions?', "
        "or 'How much did I spend on food?'"
    )
