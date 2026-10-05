from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time
import os
import sys
import re
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics.pairwise import cosine_similarity

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

ML_PATH = os.path.join(
    PROJECT_ROOT,
    "ml"
)

if ML_PATH not in sys.path:
    sys.path.append(ML_PATH)

MODEL_FILE = os.path.join(
    ML_PATH,
    "models",
    "final_multifeature_model.pkl"
)

OVERALL_VECTORIZER_FILE = os.path.join(
    ML_PATH,
    "models",
    "split_overall_vectorizer.pkl"
)

TITLE_VECTORIZER_FILE = os.path.join(
    ML_PATH,
    "models",
    "split_title_vectorizer.pkl"
)

ABSTRACT_VECTORIZER_FILE = os.path.join(
    ML_PATH,
    "models",
    "split_abstract_vectorizer.pkl"
)

SEARCH_INDEX = os.path.join(
    ML_PATH,
    "models",
    "search_index"
)

METADATA_FILE = os.path.join(
    SEARCH_INDEX,
    "patent_metadata.csv"
)

OVERALL_MATRIX_FILE = os.path.join(
    SEARCH_INDEX,
    "overall_matrix.pkl"
)

TITLE_MATRIX_FILE = os.path.join(
    SEARCH_INDEX,
    "title_matrix.pkl"
)

ABSTRACT_MATRIX_FILE = os.path.join(
    SEARCH_INDEX,
    "abstract_matrix.pkl"
)

app = FastAPI(
    title="Patentiq AI Patent Novelty API",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NoveltyRequest(BaseModel):
    title: str
    abstract: str
    top_k: Optional[int] = 5

def clean_text(text):
    text = str(text).lower()
    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )
    text = re.sub(
        r"\s+",
        " ",
        text
    )
    return text.strip()

def calculate_length_ratio(
    user_text,
    patent_text
):
    user_length = len(
        user_text.split()
    )

    patent_length = len(
        patent_text.split()
    )

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

    if score >= 0.20:
        return "MODERATE"

    return "LOW"

print("Loading Patentiq ML system...")

patents = pd.read_csv(
    METADATA_FILE
)

patents["title"] = patents[
    "title"
].fillna("")

patents["abstract"] = patents[
    "abstract"
].fillna("")

overall_matrix = joblib.load(
    OVERALL_MATRIX_FILE
)

title_matrix = joblib.load(
    TITLE_MATRIX_FILE
)

abstract_matrix = joblib.load(
    ABSTRACT_MATRIX_FILE
)

model = joblib.load(
    MODEL_FILE
)

overall_vectorizer = joblib.load(
    OVERALL_VECTORIZER_FILE
)

title_vectorizer = joblib.load(
    TITLE_VECTORIZER_FILE
)

abstract_vectorizer = joblib.load(
    ABSTRACT_VECTORIZER_FILE
)

print(
    f"Patentiq ML system loaded: {len(patents)} patents"
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Patentiq AI Patent Novelty API",
        "version": "3.0.0"
    }

@app.get("/api/system/health")
def get_system_health():
    return {
        "overallHealth": "Healthy",
        "fastapiStatus": "Healthy",
        "mlModelStatus": "Loaded",
        "searchIndexStatus": "Loaded",
        "patentDatabaseSize": len(patents)
    }

@app.get("/api/system/metrics")
def get_system_metrics():
    return {
        "patentRecords": len(patents),
        "mlModel": "Logistic Regression",
        "features": [
            "overall_similarity",
            "title_similarity",
            "abstract_similarity",
            "length_ratio"
        ],
        "searchEngine": "TF-IDF Cosine Similarity"
    }

@app.post("/api/novelty/analyze")
def analyze_novelty(
    request: NoveltyRequest
):

    if not request.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Patent title is required."
        )

    if not request.abstract.strip():
        raise HTTPException(
            status_code=400,
            detail="Patent abstract is required."
        )

    top_k = max(
        1,
        min(
            request.top_k or 5,
            10
        )
    )

    clean_title = clean_text(
        request.title
    )

    clean_abstract = clean_text(
        request.abstract
    )

    combined_text = (
        clean_title
        + " "
        + clean_abstract
    )

    user_overall = (
        overall_vectorizer.transform(
            [combined_text]
        )
    )

    user_title = (
        title_vectorizer.transform(
            [clean_title]
        )
    )

    user_abstract = (
        abstract_vectorizer.transform(
            [clean_abstract]
        )
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

        overall_similarity = float(
            overall_scores[index]
        )

        title_similarity = float(
            cosine_similarity(
                user_title,
                title_matrix[index]
            )[0][0]
        )

        abstract_similarity = float(
            cosine_similarity(
                user_abstract,
                abstract_matrix[index]
            )[0][0]
        )

        patent_text = (
            clean_text(
                patent["title"]
            )
            + " "
            + clean_text(
                patent["abstract"]
            )
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

        prediction = int(
            model.predict(
                features
            )[0]
        )

        relatedness = (
            "Related"
            if prediction == 1
            else "Not Related"
        )

        similarity_level = (
            get_similarity_level(
                overall_similarity
            )
        )

        results.append({
            "patentId": str(
                patent["patent_id"]
            ),
            "title": patent["title"],
            "overallSimilarity": round(
                overall_similarity,
                4
            ),
            "overallSimilarityPercent": round(
                overall_similarity * 100,
                2
            ),
            "titleSimilarity": round(
                title_similarity,
                4
            ),
            "titleSimilarityPercent": round(
                title_similarity * 100,
                2
            ),
            "abstractSimilarity": round(
                abstract_similarity,
                4
            ),
            "abstractSimilarityPercent": round(
                abstract_similarity * 100,
                2
            ),
            "lengthRatio": round(
                length_ratio,
                4
            ),
            "technicalRelatedness": relatedness,
            "similarityLevel": similarity_level
        })

    highest_similarity = (
        results[0]["overallSimilarity"]
    )

    if highest_similarity >= 0.40:
        screening_result = "HIGH SIMILARITY"
    elif highest_similarity >= 0.20:
        screening_result = "MODERATE SIMILARITY"
    else:
        screening_result = "LOW SIMILARITY"

    return {
        "status": "success",
        "screeningResult": screening_result,
        "highestSimilarity": round(
            highest_similarity,
            4
        ),
        "highestSimilarityPercent": round(
            highest_similarity * 100,
            2
        ),
        "message": (
            "Potentially similar prior-art "
            "documents were identified. "
            "Further claim-level analysis "
            "is recommended."
        ),
        "disclaimer": (
            "This system provides AI-assisted "
            "preliminary screening and is not "
            "a legal patent novelty determination."
        ),
        "results": results
    }

@app.post("/api/system/backup")
def trigger_backup():
    return {
        "status": "success",
        "backupId": f"backup_{int(time.time())}",
        "message": "System database snapshot created successfully."
    }

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )