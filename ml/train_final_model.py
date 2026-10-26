import pandas as pd
import joblib
import os

from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

train_file = "ml/data/clean_train_features.csv"
test_file = "ml/data/clean_test_features.csv"

os.makedirs("ml/models", exist_ok=True)

train_df = pd.read_csv(train_file)
test_df = pd.read_csv(test_file)

features = [
    "overall_similarity",
    "title_similarity",
    "abstract_similarity",
    "length_ratio"
]

X_train = train_df[features]
y_train = train_df["label"]

X_test = test_df[features]
y_test = test_df["label"]

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))
print()

models = {
    "Logistic Regression": LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42
    ),
    "Linear SVM": LinearSVC(
        class_weight="balanced",
        random_state=42
    )
}

results = {}

for name, model in models.items():

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    results[name] = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1
    }

    print(name)
    print("Accuracy :", round(accuracy, 4))
    print("Precision:", round(precision, 4))
    print("Recall   :", round(recall, 4))
    print("F1 Score :", round(f1, 4))
    print()

    print("Classification Report")
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

best_model_name = max(
    results,
    key=lambda name: results[name]["f1"]
)

best_model = models[best_model_name]

model_file = "ml/models/final_multifeature_model.pkl"

joblib.dump(
    best_model,
    model_file
)

print("Best model:", best_model_name)
print("Model saved to:", model_file)
print("Features used:", features)

if hasattr(best_model, "coef_"):

    print()
    print("Feature Coefficients")

    for feature, coefficient in zip(
        features,
        best_model.coef_[0]
    ):
        print(
            feature,
            ":",
            round(coefficient, 6)
        )