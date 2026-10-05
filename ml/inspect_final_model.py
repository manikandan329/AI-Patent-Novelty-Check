import joblib

model_file = "ml/models/final_patent_relatedness_model.pkl"

model = joblib.load(model_file)

print("Model type:", type(model).__name__)
print("Coefficient:", model.coef_[0][0])
print("Intercept:", model.intercept_[0])

boundary = -model.intercept_[0] / model.coef_[0][0]

print()
print("Decision boundary:", boundary)

print()
print("Decision scores")

values = [
    0.0,
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
    0.90,
    1.0
]

for value in values:

    score = (
        model.coef_[0][0] * value
        + model.intercept_[0]
    )

    if score >= 0:
        result = "Related"
    else:
        result = "Not Related"

    print(
        "Similarity:",
        value,
        "| Score:",
        round(score, 4),
        "|",
        result
    )