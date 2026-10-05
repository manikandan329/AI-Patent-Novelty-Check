import joblib
import pandas as pd

model_file = "ml/models/final_patent_relatedness_model.pkl"

model = joblib.load(model_file)

values = [
    0.05,
    0.10,
    0.15,
    0.20,
    0.25,
    0.30,
    0.40,
    0.50,
    0.60,
    0.70,
    0.80,
    0.90
]

X = pd.DataFrame({
    "similarity": values
})

predictions = model.predict(X)

print("Final Patent Relatedness Model")
print()

for similarity, prediction in zip(values, predictions):

    if prediction == 1:
        result = "Related"
    else:
        result = "Not Related"

    print(
        "Similarity:",
        similarity,
        "->",
        result
    )