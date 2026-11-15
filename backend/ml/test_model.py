from pathlib import Path
import joblib

model_path = Path(__file__).resolve().parent / "expense_model.pkl"
model = joblib.load(model_path)

test_descriptions = [
    "swiggy dinner",
    "uber ride to airport",
    "amazon shoes",
    "electricity bill payment",
    "netflix subscription",
    "doctor consultation fee",
    "monthly salary payment",
    "freelance project payment",
    "supermarket groceries",
    "petrol refill for bike",
]

for description in test_descriptions:
    prediction = model.predict([description])[0]
    print(f"{description} -> {prediction}")
