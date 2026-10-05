import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

input_file = "ml/data/improved_training_pairs.csv"
model_file = "ml/models/improved_patent_relatedness_model.pkl"

df = pd.read_csv(input_file)

features = [
    "overall_similarity",
    "title_similarity",
    "abstract_similarity",
    "length_ratio",
    "cpc_prefix_match"
]

X = df[features]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = joblib.load(model_file)

predictions = model.predict(X_test)

print("Classification Report")
print()
print(
    classification_report(
        y_test,
        predictions,
        target_names=[
            "Not Related",
            "Related"
        ],
        zero_division=0
    )
)

print("Confusion Matrix")
print(
    confusion_matrix(
        y_test,
        predictions
    )
)

print()
print("Feature Coefficients")

for feature, coefficient in zip(
    features,
    model.coef_[0]
):
    print(
        feature,
        ":",
        round(coefficient, 6)
    )