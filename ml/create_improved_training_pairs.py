import pandas as pd
import numpy as np
import random

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

random.seed(42)
np.random.seed(42)

input_file = "ml/data/patents_with_cpc.csv"
output_file = "ml/data/improved_training_pairs.csv"

df = pd.read_csv(input_file)

df["title"] = df["title"].fillna("")
df["abstract"] = df["abstract"].fillna("")
df["cpc_label"] = df["cpc_label"].fillna("")

df["text"] = (
    df["title"] + " " + df["abstract"]
).str.lower()

sample_size = min(4000, len(df))

sample_df = df.sample(
    n=sample_size,
    random_state=42
).reset_index(drop=True)

print("Preparing", sample_size, "patents...")

cpc_groups = {}

for index, cpc in enumerate(sample_df["cpc_label"]):
    cpc_groups.setdefault(cpc, []).append(index)

valid_groups = {
    cpc: indexes
    for cpc, indexes in cpc_groups.items()
    if len(indexes) >= 2
}

print("CPC groups prepared:", len(valid_groups))

positive_pairs = []
negative_pairs = []

all_indexes = np.arange(sample_size)

for index in all_indexes:

    cpc = sample_df.at[index, "cpc_label"]

    candidates = valid_groups.get(cpc, [])

    if candidates:
        positive_index = random.choice(candidates)

        while positive_index == index and len(candidates) > 1:
            positive_index = random.choice(candidates)

        if positive_index != index:
            positive_pairs.append(
                (index, positive_index, 1)
            )

    negative_index = random.randrange(sample_size)

    while sample_df.at[negative_index, "cpc_label"] == cpc:
        negative_index = random.randrange(sample_size)

    negative_pairs.append(
        (index, negative_index, 0)
    )

pairs = positive_pairs + negative_pairs

print("Pairs created:", len(pairs))
print("Calculating TF-IDF features...")

overall_vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=10000,
    min_df=2,
    max_df=0.95,
    ngram_range=(1, 2)
)

overall_matrix = overall_vectorizer.fit_transform(
    sample_df["text"]
)

print("Overall TF-IDF completed")

title_vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=3000,
    min_df=2,
    ngram_range=(1, 2)
)

title_matrix = title_vectorizer.fit_transform(
    sample_df["title"]
)

print("Title TF-IDF completed")

abstract_vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=7000,
    min_df=2,
    max_df=0.95,
    ngram_range=(1, 2)
)

abstract_matrix = abstract_vectorizer.fit_transform(
    sample_df["abstract"]
)

print("Abstract TF-IDF completed")
print("Calculating pair similarities...")

index_a = np.array(
    [pair[0] for pair in pairs]
)

index_b = np.array(
    [pair[1] for pair in pairs]
)

overall_similarity = np.asarray(
    overall_matrix[index_a].multiply(
        overall_matrix[index_b]
    ).sum(axis=1)
).ravel()

title_similarity = np.asarray(
    title_matrix[index_a].multiply(
        title_matrix[index_b]
    ).sum(axis=1)
).ravel()

abstract_similarity = np.asarray(
    abstract_matrix[index_a].multiply(
        abstract_matrix[index_b]
    ).sum(axis=1)
).ravel()

text_lengths = sample_df["text"].str.len().to_numpy()

length_a = text_lengths[index_a]
length_b = text_lengths[index_b]

length_ratio = (
    np.minimum(length_a, length_b)
    / np.maximum(length_a, length_b).clip(min=1)
)

cpc_values = sample_df["cpc_label"].astype(str).to_numpy()

cpc_prefix_match = (
    np.array([
        int(
            cpc_values[a][:4] ==
            cpc_values[b][:4]
        )
        for a, b in zip(index_a, index_b)
    ])
)

labels = np.array(
    [pair[2] for pair in pairs]
)

result = pd.DataFrame({
    "patent_1": sample_df.iloc[index_a]["patent_id"].to_numpy(),
    "patent_2": sample_df.iloc[index_b]["patent_id"].to_numpy(),
    "overall_similarity": overall_similarity,
    "title_similarity": title_similarity,
    "abstract_similarity": abstract_similarity,
    "length_ratio": length_ratio,
    "cpc_prefix_match": cpc_prefix_match,
    "label": labels
})

result.to_csv(
    output_file,
    index=False
)

print()
print("Improved training dataset created")
print("Total pairs:", len(result))
print(
    "Positive pairs:",
    int((result["label"] == 1).sum())
)
print(
    "Negative pairs:",
    int((result["label"] == 0).sum())
)
print()
print(result.head())
print()
print("Saved to:", output_file)