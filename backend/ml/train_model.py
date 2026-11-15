from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


def train():
    current_dir = Path(__file__).resolve().parent
    dataset_path = current_dir / "expense_dataset.csv"
    model_path = current_dir / "expense_model.pkl"

    data = pd.read_csv(dataset_path)
    x_data = data["description"]
    y_data = data["category"]

    model = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2)
        )),
        ("classifier", LogisticRegression(
            max_iter=1000
        ))
    ])

    model.fit(x_data, y_data)
    joblib.dump(model, model_path)

    print("ML model trained successfully.")
    print("Categories:", sorted(data["category"].unique()))
    print(f"Model saved as {model_path}")


if __name__ == "__main__":
    train()
