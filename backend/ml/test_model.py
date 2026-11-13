import joblib


model = joblib.load("ml/expense_model.pkl")


test_descriptions = [
    "swiggy dinner",
    "uber ride",
    "amazon shoes",
    "electricity bill",
    "netflix subscription",
    "doctor consultation"
]


for description in test_descriptions:
    prediction = model.predict([description])[0]

    print(f"{description} -> {prediction}")