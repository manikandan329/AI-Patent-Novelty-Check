import pandas as pd
import numpy as np
import joblib
from sklearn.metrics.pairwise import cosine_similarity

input_file = "ml/data/patents_with_cpc.csv"
output_file = "ml/data/training_pairs.csv"

df = pd.read_csv(input_file)

df["patent_id"] = df["patent_id"].astype(str)
df["cpc_label"] = df["cpc_label"].astype(str)

vectorizer = joblib.load(
    "ml/models/tfidf_vectorizer.pkl"
)

df["text"] = (
    df["title"].fillna("") +
    " " +
    df["abstract"].fillna("")
)

sample_size = min(5000, len(df))

df = df.sample(
    n=sample_size,
    random_state=42
).reset_index(drop=True)

X = vectorizer.transform(df["text"])

rng = np.random.default_rng(42)

positive_pairs = []
negative_pairs = []

for i in range(len(df)):
    same_cpc = np.where(
        df["cpc_label"].values == df.loc[i, "cpc_label"]
    )[0]

    different_cpc = np.where(
        df["cpc_label"].values != df.loc[i, "cpc_label"]
    )[0]

    same_cpc = same_cpc[same_cpc != i]

    if len(same_cpc) > 0:
        j = rng.choice(same_cpc)

        similarity = cosine_similarity(
            X[i],
            X[j]
        )[0][0]

        positive_pairs.append({
            "patent_1": df.loc[i, "patent_id"],
            "patent_2": df.loc[j, "patent_id"],
            "similarity": float(similarity),
            "label": 1
        })

    if len(different_cpc) > 0:
        j = rng.choice(different_cpc)

        similarity = cosine_similarity(
            X[i],
            X[j]
        )[0][0]

        negative_pairs.append({
            "patent_1": df.loc[i, "patent_id"],
            "patent_2": df.loc[j, "patent_id"],
            "similarity": float(similarity),
            "label": 0
        })

positive_df = pd.DataFrame(positive_pairs)
negative_df = pd.DataFrame(negative_pairs)

pairs = pd.concat(
    [positive_df, negative_df],
    ignore_index=True
)

pairs = pairs.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)

pairs.to_csv(
    output_file,
    index=False
)

print("Training pair creation completed")
print("Total pairs:", len(pairs))
print("Positive pairs:", (pairs["label"] == 1).sum())
print("Negative pairs:", (pairs["label"] == 0).sum())
print()
print("Label distribution:")
print(pairs["label"].value_counts())
print()
print("Sample:")
print(pairs.head(10).to_string(index=False))