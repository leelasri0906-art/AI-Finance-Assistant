import joblib
from pathlib import Path


MODEL_PATH = Path(__file__).parent / "expense_model.pkl"

model = joblib.load(MODEL_PATH)


def predict_category(description: str) -> str:
    prediction = model.predict([description])[0]
    return prediction