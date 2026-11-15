import logging
from pathlib import Path
from typing import Optional
import joblib

logger = logging.getLogger("uvicorn.error")

MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "ml" / "expense_model.pkl"
DATASET_PATH = Path(__file__).resolve().parent.parent.parent / "ml" / "expense_dataset.csv"

_model = None


def _load_or_train_model():
    global _model
    if _model is not None:
        return _model

    if MODEL_PATH.exists():
        try:
            _model = joblib.load(MODEL_PATH)
            return _model
        except Exception as exc:
            logger.warning(f"Could not load ML model from {MODEL_PATH}: {exc}. Rebuilding...")

    if DATASET_PATH.exists():
        try:
            import pandas as pd
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.linear_model import LogisticRegression
            from sklearn.pipeline import Pipeline

            data = pd.read_csv(DATASET_PATH)
            pipeline = Pipeline([
                ("tfidf", TfidfVectorizer(lowercase=True, ngram_range=(1, 2))),
                ("classifier", LogisticRegression(max_iter=1000)),
            ])
            pipeline.fit(data["description"], data["category"])
            _model = pipeline
            joblib.dump(pipeline, MODEL_PATH)
            logger.info("ML model trained and saved successfully.")
            return _model
        except Exception as exc:
            logger.error(f"Failed to auto-train ML model: {exc}")

    return None


KEYWORD_RULES = {
    "Income": [
        "salary", "freelance", "bonus", "dividend", "interest", "stipend",
        "cashback", "refund", "deposit", "credit", "profit", "earnings"
    ],
    "Food": [
        "swiggy", "zomato", "restaurant", "dinner", "lunch", "breakfast",
        "pizza", "burger", "coffee", "tea", "bakery", "cafe", "groceries",
        "zepto", "blinkit", "bigbasket", "milk", "vegetables", "fruit",
        "mcdonalds", "subway", "starbucks", "dominoes", "supermarket"
    ],
    "Transport": [
        "uber", "ola", "rapido", "auto", "bus", "metro", "cab", "petrol",
        "diesel", "fuel", "train", "irctc", "flight", "airfare", "toll",
        "fastag", "parking", "bike", "car wash"
    ],
    "Bills": [
        "electricity", "water", "bill", "broadband", "wifi", "internet",
        "mobile recharge", "airtel", "jio", "phone bill", "rent",
        "maintenance", "insurance", "premium", "lpg", "gas cylinder", "dth"
    ],
    "Entertainment": [
        "netflix", "hotstar", "prime", "movie", "cinema", "pvr", "inox",
        "spotify", "youtube", "concert", "game", "gaming", "playstation",
        "bookmyshow"
    ],
    "Health": [
        "doctor", "hospital", "pharmacy", "medicine", "chemist", "clinic",
        "checkup", "dental", "gym", "cult fit", "fitness", "apollo",
        "blood test", "lab", "vitamins"
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "shoes", "clothes", "shirt",
        "tshirt", "jeans", "mall", "shopping", "store", "zara", "h&m",
        "electronics", "headphones"
    ],
}


def predict_category(description: str, transaction_type: Optional[str] = None) -> str:
    """Predict transaction category based on description and transaction type."""
    desc = (description or "").lower().strip()
    if not desc:
        return "Income" if transaction_type == "Income" else "Other"

    # If transaction is Income, prioritize Income keywords/default
    if transaction_type == "Income":
        for kw in KEYWORD_RULES["Income"]:
            if kw in desc:
                return "Income"
        return "Income"

    # Check keyword heuristics
    for cat, keywords in KEYWORD_RULES.items():
        if cat == "Income" and transaction_type != "Income":
            continue
        for kw in keywords:
            if kw in desc:
                return cat

    # Use ML model prediction
    model = _load_or_train_model()
    if model is not None:
        try:
            pred = model.predict([desc])[0]
            # Ensure an expense isn't marked as Income
            if transaction_type == "Expense" and pred == "Income":
                return "Other"
            return pred
        except Exception as exc:
            logger.warning(f"ML prediction error: {exc}")

    return "Other"
