import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os

input_file = "ml/data/patents.csv"
output_file = "ml/data/patent_pairs.csv"

df = pd.read_csv(input_file)

df["title"] = df["title"].fillna("")
df["abstract"] = df["abstract"].fillna("")

df["text"] = df["title"] + " " + df["abstract"]

df["text"] = (
    df["text"]
    .str.lower()
    .str.replace(r"[^a-z0-9\s]", " ", regex=True)
    .str.replace(r"\s+", " ", regex=True)
    .str.strip()
)

vectorizer = joblib.load("ml/models/tfidf_vectorizer.pkl")

X = vectorizer.transform(df["text"])

rng = np.random.default_rng(42)

sample_size = min(3000, len(df))

indices = rng.choice(
    len(df),
    size=sample_size,
    replace=False
)

X_sample = X[indices]

similarity_matrix = cosine_similarity(X_sample)

pairs = []

for i in range(sample_size):
    candidates = np.argsort(similarity_matrix[i])[::-1]

    added = 0

    for j in candidates:
        if i == j:
            continue

        similarity = similarity_matrix[i][j]

        pairs.append({
            "patent_1": df.iloc[indices[i]]["patent_id"],
            "patent_2": df.iloc[indices[j]]["patent_id"],
            "similarity": float(similarity)
        })

        added += 1

        if added >= 3:
            break

pairs_df = pd.DataFrame(pairs)

pairs_df.to_csv(output_file, index=False)

print("Similarity dataset created")
print("Patent pairs:", len(pairs_df))
print("Saved to:", output_file)
print()
print(pairs_df.head(10).to_string(index=False))