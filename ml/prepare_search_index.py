import pandas as pd
import joblib
import os

from sklearn.metrics.pairwise import cosine_similarity

PATENT_FILE = "ml/data/patents.csv"

OVERALL_VECTORIZER_FILE = "ml/models/split_overall_vectorizer.pkl"
TITLE_VECTORIZER_FILE = "ml/models/split_title_vectorizer.pkl"
ABSTRACT_VECTORIZER_FILE = "ml/models/split_abstract_vectorizer.pkl"

OUTPUT_DIR = "ml/models/search_index"

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Loading patent database...")

patents = pd.read_csv(PATENT_FILE)

patents["title"] = patents["title"].fillna("")
patents["abstract"] = patents["abstract"].fillna("")

print("Patent records:", len(patents))

print("Loading vectorizers...")

overall_vectorizer = joblib.load(
    OVERALL_VECTORIZER_FILE
)

title_vectorizer = joblib.load(
    TITLE_VECTORIZER_FILE
)

abstract_vectorizer = joblib.load(
    ABSTRACT_VECTORIZER_FILE
)

print("Vectorizers loaded")
print()

print("Creating overall TF-IDF matrix...")

overall_matrix = overall_vectorizer.transform(
    patents["title"] + " " + patents["abstract"]
)

print("Overall matrix:", overall_matrix.shape)

print("Creating title TF-IDF matrix...")

title_matrix = title_vectorizer.transform(
    patents["title"]
)

print("Title matrix:", title_matrix.shape)

print("Creating abstract TF-IDF matrix...")

abstract_matrix = abstract_vectorizer.transform(
    patents["abstract"]
)

print("Abstract matrix:", abstract_matrix.shape)

print()
print("Saving search index...")

joblib.dump(
    overall_matrix,
    f"{OUTPUT_DIR}/overall_matrix.pkl"
)

joblib.dump(
    title_matrix,
    f"{OUTPUT_DIR}/title_matrix.pkl"
)

joblib.dump(
    abstract_matrix,
    f"{OUTPUT_DIR}/abstract_matrix.pkl"
)

patents[
    [
        "patent_id",
        "title",
        "abstract"
    ]
].to_csv(
    f"{OUTPUT_DIR}/patent_metadata.csv",
    index=False
)

print()
print("Search index created successfully")
print("Saved to:", OUTPUT_DIR)
print("Files:")
print("overall_matrix.pkl")
print("title_matrix.pkl")
print("abstract_matrix.pkl")
print("patent_metadata.csv")