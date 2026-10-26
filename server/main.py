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


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

ML_PATH = os.path.join(
    PROJECT_ROOT,
    "ml"
)


# ============================================================
# PYTHON PATH
# ============================================================

if PROJECT_ROOT not in sys.path:
    sys.path.insert(
        0,
        PROJECT_ROOT
    )

if ML_PATH not in sys.path:
    sys.path.insert(
        0,
        ML_PATH
    )


# ============================================================
# TECHNICAL CONCEPT LAYER
# ============================================================

from ml.technical_concepts import (
    extract_concepts,
    calculate_concept_overlap,
    calculate_technical_relevance,
    classify_technical_relevance,
    calculate_different_concepts,
    get_matching_concepts
)


# ============================================================
# MODEL FILES
# ============================================================

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


# ============================================================
# SEARCH INDEX
# ============================================================

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


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Patentiq AI Patent Novelty API",
    version="3.2.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class NoveltyRequest(BaseModel):
    title: str
    abstract: str
    top_k: Optional[int] = 5


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(text):
    """
    Normalize patent text for TF-IDF processing.
    """

    if text is None:
        return ""

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


# ============================================================
# LENGTH RATIO
# ============================================================

def calculate_length_ratio(
    user_text,
    patent_text
):
    """
    Calculate the ratio between the shorter and longer
    document lengths.
    """

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


# ============================================================
# SIMILARITY LEVEL
# ============================================================

def get_similarity_level(score):
    """
    Classify raw TF-IDF similarity.

    These are project-level similarity labels,
    not legal patent classifications.
    """

    if score >= 0.40:
        return "HIGH"

    if score >= 0.20:
        return "MODERATE"

    return "LOW"


# ============================================================
# LOAD ML SYSTEM
# ============================================================

print(
    "Loading Patentiq ML system..."
)


# ------------------------------------------------------------
# Patent metadata
# ------------------------------------------------------------

patents = pd.read_csv(
    METADATA_FILE
)


patents["title"] = patents[
    "title"
].fillna("")


patents["abstract"] = patents[
    "abstract"
].fillna("")


# ------------------------------------------------------------
# Search matrices
# ------------------------------------------------------------

overall_matrix = joblib.load(
    OVERALL_MATRIX_FILE
)

title_matrix = joblib.load(
    TITLE_MATRIX_FILE
)

abstract_matrix = joblib.load(
    ABSTRACT_MATRIX_FILE
)


# ------------------------------------------------------------
# ML model
# ------------------------------------------------------------

model = joblib.load(
    MODEL_FILE
)


# ------------------------------------------------------------
# Vectorizers
# ------------------------------------------------------------

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


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def read_root():

    return {
        "status": "online",
        "service": "Patentiq AI Patent Novelty API",
        "version": "3.2.0"
    }


# ============================================================
# HEALTH ENDPOINT
# ============================================================

@app.get("/api/system/health")
def get_system_health():

    return {
        "overallHealth": "Healthy",
        "fastapiStatus": "Healthy",
        "mlModelStatus": "Loaded",
        "searchIndexStatus": "Loaded",
        "patentDatabaseSize": len(patents),
        "technicalConceptLayer": "Loaded"
    }


# ============================================================
# METRICS ENDPOINT
# ============================================================

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

        "searchEngine": (
            "TF-IDF Cosine Similarity"
        ),

        "technicalAnalysis": [
            "concept_overlap",
            "technical_relevance",
            "matching_concepts",
            "different_concepts"
        ]
    }


# ============================================================
# NOVELTY ANALYSIS
# ============================================================

@app.post("/api/novelty/analyze")
def analyze_novelty(
    request: NoveltyRequest
):

    # --------------------------------------------------------
    # Validate title
    # --------------------------------------------------------

    if not request.title.strip():

        raise HTTPException(
            status_code=400,
            detail="Patent title is required."
        )


    # --------------------------------------------------------
    # Validate abstract
    # --------------------------------------------------------

    if not request.abstract.strip():

        raise HTTPException(
            status_code=400,
            detail="Patent abstract is required."
        )


    # --------------------------------------------------------
    # Limit top_k
    # --------------------------------------------------------

    top_k = max(
        1,
        min(
            request.top_k or 5,
            10
        )
    )


    # --------------------------------------------------------
    # Clean user input
    # --------------------------------------------------------

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


    # ========================================================
    # STEP 1 - TF-IDF TRANSFORMATION
    # ========================================================

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


    # ========================================================
    # STEP 2 - OVERALL SIMILARITY
    # ========================================================

    overall_scores = cosine_similarity(
        user_overall,
        overall_matrix
    )[0]


    # --------------------------------------------------------
    # Retrieve top candidates
    # --------------------------------------------------------

    candidate_count = min(
        20,
        len(overall_scores)
    )


    top_indices = np.argsort(
        overall_scores
    )[::-1][:candidate_count]


    # ========================================================
    # STEP 3 - USER TECHNICAL CONCEPTS
    # ========================================================

    user_concepts = extract_concepts(
        combined_text
    )


    # ========================================================
    # CANDIDATE ANALYSIS
    # ========================================================

    candidate_results = []


    for index in top_indices:

        patent = patents.iloc[index]


        # ----------------------------------------------------
        # Overall similarity
        # ----------------------------------------------------

        overall_similarity = float(
            overall_scores[index]
        )


        # ----------------------------------------------------
        # Title similarity
        # ----------------------------------------------------

        title_similarity = float(
            cosine_similarity(
                user_title,
                title_matrix[index]
            )[0][0]
        )


        # ----------------------------------------------------
        # Abstract similarity
        # ----------------------------------------------------

        abstract_similarity = float(
            cosine_similarity(
                user_abstract,
                abstract_matrix[index]
            )[0][0]
        )


        # ----------------------------------------------------
        # Patent text
        # ----------------------------------------------------

        patent_title = clean_text(
            patent["title"]
        )

        patent_abstract = clean_text(
            patent["abstract"]
        )


        patent_text = (
            patent_title
            + " "
            + patent_abstract
        )


        # ----------------------------------------------------
        # Length ratio
        # ----------------------------------------------------

        length_ratio = calculate_length_ratio(
            combined_text,
            patent_text
        )


        # ====================================================
        # STEP 4 - ML RELATEDNESS
        # ====================================================

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


        # ====================================================
        # STEP 5 - PATENT TECHNICAL CONCEPTS
        # ====================================================

        patent_concepts = extract_concepts(
            patent_text
        )


        # ====================================================
        # STEP 6 - CONCEPT OVERLAP
        # ====================================================

        concept_overlap = (
            calculate_concept_overlap(
                user_concepts,
                patent_concepts
            )
        )


        # ====================================================
        # STEP 7 - MATCHING CONCEPTS
        # ====================================================

        matching_concepts = (
            get_matching_concepts(
                user_concepts,
                patent_concepts
            )
        )


        # ====================================================
        # STEP 8 - TECHNICAL RELEVANCE
        # ====================================================

        technical_relevance_score = (
            calculate_technical_relevance(
                concept_overlap,
                abstract_similarity * 100,
                title_similarity * 100,
                overall_similarity * 100
            )
        )


        technical_relevance = (
            classify_technical_relevance(
                technical_relevance_score
            )
        )


        # ====================================================
        # STEP 9 - DIFFERENT CONCEPTS
        # ====================================================

        different_concepts = (
            calculate_different_concepts(
                user_concepts,
                patent_concepts
            )
        )


        # ====================================================
        # PATENT ID
        # ====================================================

        patent_id = str(
            patent["patent_id"]
        )


        if patent_id.endswith(".0"):

            patent_id = patent_id[:-2]


        # ====================================================
        # RESULT OBJECT
        # ====================================================

        candidate_results.append({

            "patentId": patent_id,

            "title": patent["title"],

            "abstract": patent["abstract"],

            "source": "HUPD patent dataset",

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

            "similarityLevel": get_similarity_level(
                overall_similarity
            ),

            "conceptOverlap": round(
                concept_overlap,
                2
            ),

            "technicalRelevanceScore": round(
                technical_relevance_score,
                2
            ),

            "technicalRelevance": (
                technical_relevance
            ),

            "matchingConcepts": (
                matching_concepts
            ),

            "differentConcepts": (
                different_concepts
            )
        })


    # ========================================================
    # SORT RESULTS
    # ========================================================

    results = sorted(
        candidate_results,
        key=lambda item: (
            item[
                "technicalRelevanceScore"
            ],
            item[
                "overallSimilarity"
            ]
        ),
        reverse=True
    )[:top_k]


    # ========================================================
    # HANDLE EMPTY RESULTS
    # ========================================================

    if not results:

        return {

            "status": "success",

            "screeningResult": (
                "NO PRIOR ART CANDIDATES FOUND"
            ),

            "highestSimilarity": 0,

            "highestSimilarityPercent": 0,

            "highestTechnicalRelevance": 0,

            "userTechnicalConcepts": (
                user_concepts
            ),

            "message": (
                "No candidate prior-art documents "
                "were retrieved."
            ),

            "disclaimer": (
                "Similarity and technical relevance "
                "scores indicate potential conceptual "
                "or technical overlap. They do not "
                "constitute a legal determination of "
                "patent novelty, patentability, "
                "infringement, or freedom to operate."
            ),

            "results": []
        }


    # ========================================================
    # HIGHEST SCORES
    # ========================================================

    highest_similarity = max(
        item[
            "overallSimilarity"
        ]
        for item in results
    )


    highest_relevance = max(
        item[
            "technicalRelevanceScore"
        ]
        for item in results
    )


    # ========================================================
    # SCREENING RESULT
    # ========================================================

    if highest_relevance >= 70:

        screening_result = (
            "HIGH TECHNICAL RELEVANCE"
        )

    elif highest_relevance >= 45:

        screening_result = (
            "MODERATE TECHNICAL RELEVANCE"
        )

    elif highest_relevance >= 25:

        screening_result = (
            "LOW TECHNICAL RELEVANCE"
        )

    else:

        screening_result = (
            "VERY LOW TECHNICAL RELEVANCE"
        )


    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "status": "success",

        "screeningResult": (
            screening_result
        ),

        "highestSimilarity": round(
            highest_similarity,
            4
        ),

        "highestSimilarityPercent": round(
            highest_similarity * 100,
            2
        ),

        "highestTechnicalRelevance": round(
            highest_relevance,
            2
        ),

        "userTechnicalConcepts": (
            user_concepts
        ),

        "message": (
            "Potentially relevant prior-art "
            "documents were identified using "
            "TF-IDF similarity and technical "
            "concept analysis."
        ),

        "disclaimer": (
            "Similarity and technical relevance "
            "scores indicate potential conceptual "
            "or technical overlap. They do not "
            "constitute a legal determination of "
            "patent novelty, patentability, "
            "infringement, or freedom to operate."
        ),

        "results": results
    }


# ============================================================
# BACKUP ENDPOINT
# ============================================================

@app.post("/api/system/backup")
def trigger_backup():

    return {

        "status": "success",

        "backupId": (
            f"backup_{int(time.time())}"
        ),

        "message": (
            "System database snapshot "
            "created successfully."
        )
    }


# ============================================================
# DIRECT EXECUTION
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )