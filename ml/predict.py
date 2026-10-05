import joblib
import pandas as pd

model = joblib.load("ml/models/patent_relatedness_model.pkl")

def predict_relatedness(similarity):
    X = pd.DataFrame({"similarity": [similarity]})

    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0][1]

    if prediction == 1:
        result = "Related"
    else:
        result = "Not Related"

    return result, probability

print("Patent Relatedness Prediction")
print()

similarity = float(input("Enter cosine similarity (0 to 1): "))

if similarity < 0 or similarity > 1:
    print("Similarity must be between 0 and 1.")
else:
    result, probability = predict_relatedness(similarity)

    print()
    print("Prediction:", result)
    print("Relatedness Probability:", round(probability * 100, 2), "%")