import pandas as pd
import numpy as np
import joblib
import os

from sklearn.model_selection import train_test_split

input_file = "ml/data/patents_with_cpc.csv"
vectorizer_file = "ml/models/tfidf_vectorizer.pkl"
output_dir = "ml/data"

df = pd.read_csv(input_file)

df["patent_id"] = df["patent_id"].astype(str)
df["title"] = df["title"].fillna("")
df["abstract"] = df["abstract"].fillna("")
df["cpc_label"] = df["cpc_label"].fillna("UNKNOWN")

df["text"] = (
    df["title"] + " " + df["abstract"]
).str.lower()

train_df, test_df = train_test_split(
    df,
    test_size=0.2,
    random_state=42
)

print("Total patents:", len(df))
print("Training patents:", len(train_df))
print("Testing patents:", len(test_df))
print()

vectorizer = joblib.load(vectorizer_file)

print("Creating TF-IDF matrices...")

train_matrix = vectorizer.transform(train_df["text"])
test_matrix = vectorizer.transform(test_df["text"])

print("TF-IDF matrices created")
print()

def prepare_groups(dataframe):
    groups = {}

    for index, row in dataframe.iterrows():
        cpc = row["cpc_label"]

        if cpc not in groups:
            groups[cpc] = []

        groups[cpc].append(index)

    return groups

train_groups = prepare_groups(train_df)
test_groups = prepare_groups(test_df)

rng = np.random.default_rng(42)

def create_pairs(dataframe, matrix, groups, positive_count, negative_count):

    indices = np.array(dataframe.index)

    positive_pairs = []
    negative_pairs = []

    print("Creating positive pairs...")

    while len(positive_pairs) < positive_count:

        index1 = rng.choice(indices)
        row1 = dataframe.loc[index1]

        candidates = groups.get(row1["cpc_label"], [])

        if len(candidates) < 2:
            continue

        index2 = rng.choice(candidates)

        if index1 == index2:
            continue

        position1 = dataframe.index.get_loc(index1)
        position2 = dataframe.index.get_loc(index2)

        similarity = matrix[position1].multiply(
            matrix[position2]
        ).sum()

        positive_pairs.append({
            "patent_1": row1["patent_id"],
            "patent_2": dataframe.loc[index2, "patent_id"],
            "similarity": float(similarity),
            "label": 1
        })

        if len(positive_pairs) % 500 == 0:
            print(
                "Positive pairs:",
                len(positive_pairs),
                "/",
                positive_count
            )

    print()
    print("Creating negative pairs...")

    cpc_values = dataframe["cpc_label"].values

    while len(negative_pairs) < negative_count:

        index1 = rng.choice(indices)
        row1 = dataframe.loc[index1]

        index2 = rng.choice(indices)

        if index1 == index2:
            continue

        if row1["cpc_label"] == dataframe.loc[index2, "cpc_label"]:
            continue

        position1 = dataframe.index.get_loc(index1)
        position2 = dataframe.index.get_loc(index2)

        similarity = matrix[position1].multiply(
            matrix[position2]
        ).sum()

        negative_pairs.append({
            "patent_1": row1["patent_id"],
            "patent_2": dataframe.loc[index2, "patent_id"],
            "similarity": float(similarity),
            "label": 0
        })

        if len(negative_pairs) % 500 == 0:
            print(
                "Negative pairs:",
                len(negative_pairs),
                "/",
                negative_count
            )

    return pd.DataFrame(
        positive_pairs + negative_pairs
    )

print("Generating training pairs...")

train_pairs = create_pairs(
    train_df,
    train_matrix,
    train_groups,
    2000,
    2000
)

print()
print("Generating testing pairs...")

test_pairs = create_pairs(
    test_df,
    test_matrix,
    test_groups,
    500,
    500
)

train_file = os.path.join(
    output_dir,
    "clean_train_pairs.csv"
)

test_file = os.path.join(
    output_dir,
    "clean_test_pairs.csv"
)

train_pairs.to_csv(
    train_file,
    index=False
)

test_pairs.to_csv(
    test_file,
    index=False
)

print()
print("Dataset creation completed")
print()

print("Training pairs:", len(train_pairs))
print("Training positive:", len(train_pairs[train_pairs["label"] == 1]))
print("Training negative:", len(train_pairs[train_pairs["label"] == 0]))

print()

print("Testing pairs:", len(test_pairs))
print("Testing positive:", len(test_pairs[test_pairs["label"] == 1]))
print("Testing negative:", len(test_pairs[test_pairs["label"] == 0]))

print()
print("Saved:")
print(train_file)
print(test_file)