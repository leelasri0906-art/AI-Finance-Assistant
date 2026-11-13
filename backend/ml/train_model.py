import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


# Load training dataset
data = pd.read_csv("ml/expense_dataset.csv")

X = data["description"]
y = data["category"]


# Create ML pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2)
    )),
    ("classifier", LogisticRegression(
        max_iter=1000
    ))
])


# Train model
model.fit(X, y)


# Save trained model
joblib.dump(model, "ml/expense_model.pkl")

print("ML model trained successfully.")
print("Categories:", sorted(data["category"].unique()))
print("Model saved as ml/expense_model.pkl")