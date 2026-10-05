import pandas as pd
import numpy as np
import joblib
import re

from sklearn.metrics.pairwise import cosine_similarity

MODEL_FILE = "ml/models/final_multifeature_model.pkl"

OVERALL_VECTORIZER_FILE = "ml/models/split_overall_vectorizer.pkl"
TITLE_VECTORIZER_FILE = "ml/models/split_title_vectorizer.pkl"
ABSTRACT_VECTORIZER_FILE = "ml/models/split_abstract_vectorizer.pkl"

SEARCH_INDEX = "ml/models/search_index"

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

print("Loading patent search index...")

patents = pd.read_csv(
    f"{SEARCH_INDEX}/patent_metadata.csv"
)

patents["title"] = patents["title"].fillna("")
patents["abstract"] = patents["abstract"].fillna("")

overall_matrix = joblib.load(
    f"{SEARCH_INDEX}/overall_matrix.pkl"
)

title_matrix = joblib.load(
    f"{SEARCH_INDEX}/title_matrix.pkl"
)

abstract_matrix = joblib.load(
    f"{SEARCH_INDEX}/abstract_matrix.pkl"
)

print("Patent search index loaded")
print("Patent records:", len(patents))

print("Loading ML model...")

model = joblib.load(MODEL_FILE)

overall_vectorizer = joblib.load(
    OVERALL_VECTORIZER_FILE
)

title_vectorizer = joblib.load(
    TITLE_VECTORIZER_FILE
)

abstract_vectorizer = joblib.load(
    ABSTRACT_VECTORIZER_FILE
)

print("ML components loaded")
print()

def calculate_length_ratio(user_text, patent_text):

    user_length = len(user_text.split())
    patent_length = len(patent_text.split())

    if user_length == 0 or patent_length == 0:
        return 0.0

    return min(
        user_length,
        patent_length
    ) / max(
        user_length,
        patent_length
    )

def get_similarity_level(score):

    if score >= 0.40:
        return "HIGH"
    elif score >= 0.20:
        return "MODERATE"
    else:
        return "LOW"

def analyze_patent(title, abstract, top_k=5):

    clean_title = clean_text(title)
    clean_abstract = clean_text(abstract)

    combined_text = (
        clean_title
        + " "
        + clean_abstract
    )

    user_overall = overall_vectorizer.transform(
        [combined_text]
    )

    user_title = title_vectorizer.transform(
        [clean_title]
    )

    user_abstract = abstract_vectorizer.transform(
        [clean_abstract]
    )

    overall_scores = cosine_similarity(
        user_overall,
        overall_matrix
    )[0]

    top_indices = np.argsort(
        overall_scores
    )[::-1][:top_k]

    results = []

    for index in top_indices:

        patent = patents.iloc[index]

        overall_similarity = overall_scores[index]

        title_similarity = cosine_similarity(
            user_title,
            title_matrix[index]
        )[0][0]

        abstract_similarity = cosine_similarity(
            user_abstract,
            abstract_matrix[index]
        )[0][0]

        patent_text = (
            clean_text(patent["title"])
            + " "
            + clean_text(patent["abstract"])
        )

        length_ratio = calculate_length_ratio(
            combined_text,
            patent_text
        )

        features = pd.DataFrame(
            [[
                overall_similarity,
                title_similarity,
                abstract_similarity,
                length_ratio
            ]],
            columns=[
                "overall_similarity",
                "title_similarity",
                "abstract_similarity",
                "length_ratio"
            ]
        )

        prediction = model.predict(
            features
        )[0]

        if prediction == 1:
            relatedness = "Related"
        else:
            relatedness = "Not Related"

        similarity_level = get_similarity_level(
            overall_similarity
        )

        results.append({
            "patent_id": patent["patent_id"],
            "title": patent["title"],
            "overall_similarity": overall_similarity,
            "title_similarity": title_similarity,
            "abstract_similarity": abstract_similarity,
            "length_ratio": length_ratio,
            "prediction": relatedness,
            "similarity_level": similarity_level
        })

    return results

print("AI Patent Novelty Analyzer")
print("=" * 70)
print()

user_title = input(
    "Enter patent title: "
)

print()

user_abstract = input(
    "Enter patent abstract: "
)

print()
print("Analyzing patent...")
print()

results = analyze_patent(
    user_title,
    user_abstract,
    top_k=5
)

highest_similarity = results[0]["overall_similarity"]

if highest_similarity >= 0.40:
    screening_result = "HIGH SIMILARITY"
elif highest_similarity >= 0.20:
    screening_result = "MODERATE SIMILARITY"
else:
    screening_result = "LOW SIMILARITY"

print("=" * 70)
print("PRELIMINARY NOVELTY SCREENING")
print("=" * 70)

print()
print("Screening Result:", screening_result)

print()
print(
    "Highest Overall Similarity:",
    round(highest_similarity * 100, 2),
    "%"
)

print()
print(
    "Potentially similar prior-art documents were identified."
)

print(
    "Further claim-level analysis is recommended."
)

print()
print(
    "This system provides AI-assisted preliminary screening."
)

print(
    "It is not a legal patent novelty determination."
)

print()
print("=" * 70)
print("TOP SIMILAR PATENTS")
print("=" * 70)

for i, result in enumerate(results, 1):

    print()
    print("Rank:", i)
    print("Patent ID:", result["patent_id"])
    print("Title:", result["title"])

    print(
        "Overall Similarity:",
        round(
            result["overall_similarity"] * 100,
            2
        ),
        "%"
    )

    print(
        "Title Similarity:",
        round(
            result["title_similarity"] * 100,
            2
        ),
        "%"
    )

    print(
        "Abstract Similarity:",
        round(
            result["abstract_similarity"] * 100,
            2
        ),
        "%"
    )

    print(
        "Technical Relatedness:",
        result["prediction"]
    )

    print(
        "Similarity Level:",
        result["similarity_level"]
    )

    print("-" * 70)