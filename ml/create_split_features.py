import pandas as pd
import numpy as np
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer

input_file = "ml/data/patents_with_cpc.csv"
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

overall_vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=10000,
    min_df=2,
    max_df=0.95,
    ngram_range=(1, 2)
)

title_vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=3000,
    min_df=2,
    max_df=0.95,
    ngram_range=(1, 2)
)

abstract_vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=7000,
    min_df=2,
    max_df=0.95,
    ngram_range=(1, 2)
)

print("Creating training TF-IDF features...")

train_overall = overall_vectorizer.fit_transform(
    train_df["text"]
)

train_title = title_vectorizer.fit_transform(
    train_df["title"]
)

train_abstract = abstract_vectorizer.fit_transform(
    train_df["abstract"]
)

print("Training TF-IDF completed")
print()

print("Creating testing TF-IDF features...")

test_overall = overall_vectorizer.transform(
    test_df["text"]
)

test_title = title_vectorizer.transform(
    test_df["title"]
)

test_abstract = abstract_vectorizer.transform(
    test_df["abstract"]
)

print("Testing TF-IDF completed")
print()

os.makedirs("ml/models", exist_ok=True)

joblib.dump(
    overall_vectorizer,
    "ml/models/split_overall_vectorizer.pkl"
)

joblib.dump(
    title_vectorizer,
    "ml/models/split_title_vectorizer.pkl"
)

joblib.dump(
    abstract_vectorizer,
    "ml/models/split_abstract_vectorizer.pkl"
)

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

def create_pairs(
    dataframe,
    overall_matrix,
    title_matrix,
    abstract_matrix,
    groups,
    positive_count,
    negative_count
):

    indices = np.array(dataframe.index)

    pairs = []

    def create_pair(index1, index2, label):

        position1 = dataframe.index.get_loc(index1)
        position2 = dataframe.index.get_loc(index2)

        overall_similarity = overall_matrix[position1].multiply(
            overall_matrix[position2]
        ).sum()

        title_similarity = title_matrix[position1].multiply(
            title_matrix[position2]
        ).sum()

        abstract_similarity = abstract_matrix[position1].multiply(
            abstract_matrix[position2]
        ).sum()

        length1 = len(dataframe.loc[index1, "text"])
        length2 = len(dataframe.loc[index2, "text"])

        if max(length1, length2) == 0:
            length_ratio = 0
        else:
            length_ratio = min(length1, length2) / max(length1, length2)

        return {
            "patent_1": dataframe.loc[index1, "patent_id"],
            "patent_2": dataframe.loc[index2, "patent_id"],
            "overall_similarity": float(overall_similarity),
            "title_similarity": float(title_similarity),
            "abstract_similarity": float(abstract_similarity),
            "length_ratio": float(length_ratio),
            "label": label
        }

    print("Creating positive pairs...")

    count = 0

    while count < positive_count:

        index1 = rng.choice(indices)

        candidates = groups.get(
            dataframe.loc[index1, "cpc_label"],
            []
        )

        if len(candidates) < 2:
            continue

        index2 = rng.choice(candidates)

        if index1 == index2:
            continue

        pairs.append(
            create_pair(
                index1,
                index2,
                1
            )
        )

        count += 1

        if count % 500 == 0:
            print(
                "Positive pairs:",
                count,
                "/",
                positive_count
            )

    print()
    print("Creating negative pairs...")

    count = 0

    while count < negative_count:

        index1 = rng.choice(indices)
        index2 = rng.choice(indices)

        if index1 == index2:
            continue

        if (
            dataframe.loc[index1, "cpc_label"]
            ==
            dataframe.loc[index2, "cpc_label"]
        ):
            continue

        pairs.append(
            create_pair(
                index1,
                index2,
                0
            )
        )

        count += 1

        if count % 500 == 0:
            print(
                "Negative pairs:",
                count,
                "/",
                negative_count
            )

    return pd.DataFrame(pairs)

print("Generating training pairs...")

train_pairs = create_pairs(
    train_df,
    train_overall,
    train_title,
    train_abstract,
    train_groups,
    2000,
    2000
)

print()
print("Generating testing pairs...")

test_pairs = create_pairs(
    test_df,
    test_overall,
    test_title,
    test_abstract,
    test_groups,
    500,
    500
)

train_pairs.to_csv(
    "ml/data/clean_train_features.csv",
    index=False
)

test_pairs.to_csv(
    "ml/data/clean_test_features.csv",
    index=False
)

print()
print("Feature dataset creation completed")
print()

print("Training pairs:", len(train_pairs))
print("Testing pairs:", len(test_pairs))

print()
print("Training features:")
print(
    train_pairs.columns.tolist()
)

print()
print("Saved:")
print("ml/data/clean_train_features.csv")
print("ml/data/clean_test_features.csv")