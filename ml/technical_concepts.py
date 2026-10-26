"""
Technical Concept Analysis Layer for Patentiq

Purpose:
- Extract meaningful technical concepts from patent titles and abstracts.
- Compare technical concepts between a user's invention and prior-art patents.
- Reduce the influence of generic terms such as:
    "system", "traffic", "vehicle", "artificial intelligence", etc.
- Give stronger importance to specific technical concepts such as:
    "collision avoidance", "trajectory prediction",
    "obstacle detection", "vehicle sensing", etc.

Important:
This module performs AI-assisted technical similarity analysis.
It does NOT determine legal patent novelty, patentability,
infringement, or freedom to operate.
"""

import re
import math
from collections import Counter
from typing import List, Dict, Tuple, Set


# ============================================================
# 1. TECHNICAL CONCEPT WEIGHTS
# ============================================================

# Strong concepts:
# These describe the actual technical mechanism/problem.
STRONG_CONCEPT_WEIGHTS = {
    "collision avoidance": 1.00,
    "collision prediction": 1.00,
    "obstacle detection": 0.95,
    "trajectory analysis": 0.95,
    "trajectory prediction": 0.95,
    "vehicle sensing": 0.90,
    "vehicle communication": 0.90,
    "traffic control": 0.85,
    "wireless communication": 0.85,
    "vehicle detection": 0.85,
    "vehicle tracking": 0.85,
    "object detection": 0.85,
    "position estimation": 0.80,
    "path prediction": 0.90,
    "motion prediction": 0.90,
    "motion estimation": 0.85,
    "collision detection": 0.95,
    "avoidance control": 0.95,
    "predictive control": 0.85,
    "autonomous driving": 0.85,
    "driver assistance": 0.80,
    "advanced driver assistance": 0.90,
    "vehicle localization": 0.80,
    "vehicle positioning": 0.80,
    "sensor fusion": 0.90,
}


# Medium-strength concepts:
MEDIUM_CONCEPT_WEIGHTS = {
    "distance estimation": 0.75,
    "speed estimation": 0.75,
    "computer vision": 0.70,
    "camera sensing": 0.70,
    "traffic monitoring": 0.70,
    "traffic information": 0.65,
    "traffic signal": 0.65,
    "sensor processing": 0.70,
    "image processing": 0.65,
    "position estimation": 0.70,
    "warning generation": 0.70,
    "driver warning": 0.70,
    "real time processing": 0.45,
    "real-time processing": 0.45,
    "image recognition": 0.65,
    "object tracking": 0.80,
    "vehicle recognition": 0.75,
    "road monitoring": 0.60,
    "road condition detection": 0.65,
    "lane detection": 0.75,
    "lane tracking": 0.75,
    "lane departure detection": 0.85,
    "pedestrian detection": 0.85,
    "road obstacle detection": 0.90,
    "environment perception": 0.85,
    "environment sensing": 0.80,
}


# Supporting concepts:
# These can contribute, but should not dominate the score.
SUPPORTING_CONCEPT_WEIGHTS = {
    "collision": 0.55,
    "avoidance": 0.55,
    "warning": 0.50,
    "monitoring": 0.45,
    "prediction": 0.50,
    "estimation": 0.45,
    "sensing": 0.45,
    "tracking": 0.50,
    "detection": 0.45,
    "control": 0.45,
    "communication": 0.45,
    "wireless": 0.45,
    "camera": 0.40,
    "sensor": 0.40,
    "vision": 0.40,
    "image processing": 0.65,
}


# Combine all recognized technical concepts.
CONCEPT_WEIGHTS = {}

CONCEPT_WEIGHTS.update(STRONG_CONCEPT_WEIGHTS)
CONCEPT_WEIGHTS.update(MEDIUM_CONCEPT_WEIGHTS)
CONCEPT_WEIGHTS.update(SUPPORTING_CONCEPT_WEIGHTS)


# ============================================================
# 2. GENERIC TERMS
# ============================================================

# These terms are useful for ordinary text similarity,
# but they should NOT be treated as meaningful technical
# concepts by themselves.
GENERIC_TERMS = {
    "system",
    "systems",
    "method",
    "methods",
    "device",
    "devices",
    "apparatus",
    "apparatuses",
    "unit",
    "units",
    "module",
    "modules",
    "component",
    "components",
    "process",
    "processing",
    "technology",
    "technologies",
    "application",
    "applications",
    "data",
    "information",
    "based",
    "using",
    "used",
    "use",
    "configured",
    "configuration",
    "provide",
    "provides",
    "provided",
    "including",
    "includes",
    "comprising",
    "comprises",
    "related",
    "corresponding",
    "associated",
    "one",
    "more",
    "least",
    "plurality",
    "according",
    "thereof",
    "wherein",
    "said",
    "such",
    "may",
    "can",
    "also",
    "first",
    "second",
    "third",
    "current",
    "particular",
    "different",
    "multiple",
    "level",
    "value",
    "values",
    "result",
    "results",
    "operation",
    "operations",
    "perform",
    "performs",
    "performed",
    "determine",
    "determines",
    "determined",
    "calculate",
    "calculates",
    "calculated",
    "generate",
    "generates",
    "generated",
    "receive",
    "receives",
    "received",
    "transmit",
    "transmits",
    "transmitted",
    "response",
    "responsive",
    "control",
}


# Terms that should not become concepts even though
# they appear frequently in AI/traffic patents.
GENERIC_DOMAIN_TERMS = {
    "traffic",
    "vehicle",
    "vehicles",
    "road",
    "roads",
    "driver",
    "drivers",
    "artificial intelligence",
    "ai",
    "machine learning",
    "ml",
    "real time",
    "real-time",
    "network",
    "networks",
    "server",
    "servers",
    "remote system",
    "communication system",
}


# ============================================================
# 3. CONCEPT FAMILIES
# ============================================================

# These groups connect technically related wording.
#
# Example:
# "collision prediction"
# "predict potential collision"
# "collision detection"
#
# can all contribute to the collision-related technical family.

CONCEPT_FAMILIES = {
    "collision_avoidance": {
        "collision avoidance",
        "collision avoidance control",
        "avoidance control",
        "collision prevention",
        "collision prevention system",
        "collision mitigation",
        "crash avoidance",
        "crash prevention",
    },

    "collision_prediction": {
        "collision prediction",
        "predict collision",
        "predicting collision",
        "potential collision",
        "collision risk prediction",
        "collision risk",
        "crash prediction",
        "impact prediction",
    },

    "collision_detection": {
        "collision detection",
        "detect collision",
        "detecting collision",
        "collision determination",
        "impact detection",
        "crash detection",
    },

    "obstacle_detection": {
        "obstacle detection",
        "obstacle recognition",
        "detect obstacle",
        "detecting obstacle",
        "obstacle identification",
        "road obstacle detection",
        "obstacle sensing",
    },

    "trajectory_prediction": {
        "trajectory prediction",
        "trajectory analysis",
        "trajectory estimation",
        "path prediction",
        "path estimation",
        "motion prediction",
        "motion estimation",
        "vehicle trajectory",
        "vehicle path",
        "predicted trajectory",
    },

    "vehicle_sensing": {
        "vehicle sensing",
        "vehicle sensor",
        "vehicle sensors",
        "vehicle sensing system",
        "environment sensing",
        "environment perception",
        "vehicle perception",
    },

    "vehicle_detection": {
        "vehicle detection",
        "vehicle recognition",
        "detect vehicle",
        "detecting vehicle",
        "vehicle identification",
        "vehicle localization",
    },

    "vehicle_tracking": {
        "vehicle tracking",
        "track vehicle",
        "tracking vehicle",
        "vehicle position tracking",
        "vehicle movement tracking",
    },

    "distance_estimation": {
        "distance estimation",
        "distance measurement",
        "relative distance",
        "distance between vehicles",
        "vehicle distance",
        "distance calculation",
        "range estimation",
    },

    "speed_estimation": {
        "speed estimation",
        "speed measurement",
        "vehicle speed estimation",
        "vehicle speed",
        "velocity estimation",
        "velocity measurement",
    },

    "computer_vision": {
        "computer vision",
        "vision system",
        "machine vision",
        "visual perception",
        "image based detection",
        "vision based detection",
    },

    "camera_sensing": {
        "camera sensing",
        "camera sensor",
        "vehicle camera",
        "forward camera",
        "camera based detection",
        "camera based monitoring",
    },

    "sensor_fusion": {
        "sensor fusion",
        "multi sensor fusion",
        "sensor data fusion",
        "combined sensor data",
        "fusion of sensor data",
    },

    "traffic_control": {
        "traffic control",
        "traffic signal control",
        "traffic management",
        "traffic control system",
        "traffic signal management",
    },

    "traffic_monitoring": {
        "traffic monitoring",
        "traffic condition monitoring",
        "road traffic monitoring",
        "traffic condition detection",
        "traffic observation",
    },

    "traffic_information": {
        "traffic information",
        "traffic information acquisition",
        "traffic information processing",
        "traffic data acquisition",
        "traffic data processing",
    },

    "vehicle_communication": {
        "vehicle communication",
        "vehicle to vehicle communication",
        "vehicle-to-vehicle communication",
        "v2v communication",
        "vehicle to infrastructure communication",
        "v2i communication",
    },

    "wireless_communication": {
        "wireless communication",
        "wireless transceiver",
        "wireless transmission",
        "wireless messages",
        "radio communication",
    },

    "warning_generation": {
        "warning generation",
        "driver warning",
        "collision warning",
        "warning signal",
        "warning notification",
        "alert generation",
        "driver alert",
    },

    "lane_detection": {
        "lane detection",
        "lane recognition",
        "lane tracking",
        "lane departure detection",
        "lane position estimation",
    },

    "pedestrian_detection": {
        "pedestrian detection",
        "pedestrian recognition",
        "pedestrian tracking",
        "detect pedestrian",
    },

    "object_detection": {
        "object detection",
        "object recognition",
        "object tracking",
        "object identification",
    },
}


# ============================================================
# 4. TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    """
    Normalize patent text for concept matching.

    Converts:
    - uppercase -> lowercase
    - hyphenated words -> space
    - punctuation -> spaces
    - repeated spaces -> one space
    """

    if not text:
        return ""

    text = str(text).lower()

    # Normalize common hyphen variations.
    text = text.replace("-", " ")
    text = text.replace("–", " ")
    text = text.replace("—", " ")

    # Remove punctuation.
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Collapse whitespace.
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# 5. PHRASE NORMALIZATION
# ============================================================

def normalize_phrase(phrase: str) -> str:
    """
    Normalize an extracted concept phrase.
    """

    phrase = normalize_text(phrase)

    if not phrase:
        return ""

    words = phrase.split()

    normalized_words = []

    for word in words:
        # Basic singular/plural normalization.
        if len(word) > 4 and word.endswith("ies"):
            word = word[:-3] + "y"

        elif len(word) > 4 and word.endswith("ses"):
            word = word[:-2]

        elif len(word) > 4 and word.endswith("s") and not word.endswith("ss"):
            word = word[:-1]

        normalized_words.append(word)

    return " ".join(normalized_words)


# ============================================================
# 6. FAMILY LOOKUP
# ============================================================

NORMALIZED_FAMILIES = {}

for family_name, phrases in CONCEPT_FAMILIES.items():
    NORMALIZED_FAMILIES[family_name] = {
        normalize_phrase(phrase)
        for phrase in phrases
    }


def get_concept_family(concept: str) -> str:
    """
    Return the technical concept family for a known phrase.
    """

    normalized = normalize_phrase(concept)

    for family_name, phrases in NORMALIZED_FAMILIES.items():
        if normalized in phrases:
            return family_name

    return ""


# ============================================================
# 7. EXACT TECHNICAL PHRASE DETECTION
# ============================================================

def extract_known_technical_concepts(text: str) -> List[str]:
    """
    Extract only explicitly recognized technical concepts.

    This is the most important extraction stage.

    Unlike generic TF-IDF phrase extraction, this stage does
    not allow arbitrary phrases such as:

        "analyze traffic"
        "artificial intelligence"
        "detect vehicle"

    to become strong concepts.
    """

    normalized = normalize_text(text)

    if not normalized:
        return []

    found = []

    # Search every known technical phrase.
    for family_name, phrases in NORMALIZED_FAMILIES.items():

        for phrase in phrases:

            if not phrase:
                continue

            # Exact phrase boundary matching.
            pattern = r"\b" + re.escape(phrase) + r"\b"

            if re.search(pattern, normalized):

                # Select the most representative phrase
                # for the family.
                representative = _family_representative_phrase(
                    family_name
                )

                if representative:
                    found.append(representative)

    # Remove duplicates while preserving order.
    return _unique_preserve_order(found)


def _family_representative_phrase(family_name: str) -> str:
    """
    Select the strongest/most useful phrase representing a
    concept family.
    """

    preferred = {
        "collision_avoidance": "collision avoidance",
        "collision_prediction": "collision prediction",
        "collision_detection": "collision detection",
        "obstacle_detection": "obstacle detection",
        "trajectory_prediction": "trajectory prediction",
        "vehicle_sensing": "vehicle sensing",
        "vehicle_detection": "vehicle detection",
        "vehicle_tracking": "vehicle tracking",
        "distance_estimation": "distance estimation",
        "speed_estimation": "speed estimation",
        "computer_vision": "computer vision",
        "camera_sensing": "camera sensing",
        "sensor_fusion": "sensor fusion",
        "traffic_control": "traffic control",
        "traffic_monitoring": "traffic monitoring",
        "traffic_information": "traffic information",
        "vehicle_communication": "vehicle communication",
        "wireless_communication": "wireless communication",
        "warning_generation": "warning generation",
        "lane_detection": "lane detection",
        "pedestrian_detection": "pedestrian detection",
        "object_detection": "object detection",
    }

    return preferred.get(family_name, "")


# ============================================================
# 8. SUPPORTING TECHNICAL CONCEPT DETECTION
# ============================================================

def extract_supporting_concepts(text: str) -> List[str]:
    """
    Detect selected supporting technical concepts.

    Single words are allowed only when they have a clear
    technical meaning and are explicitly included in the
    supporting concept dictionary.
    """

    normalized = normalize_text(text)

    if not normalized:
        return []

    found = []

    for concept in SUPPORTING_CONCEPT_WEIGHTS:

        normalized_concept = normalize_phrase(concept)

        # Never allow generic domain terms to be extracted.
        if normalized_concept in {
            "traffic",
            "vehicle",
            "road",
            "driver",
            "artificial intelligence",
            "ai",
            "system",
            "data",
        }:
            continue

        pattern = r"\b" + re.escape(normalized_concept) + r"\b"

        if re.search(pattern, normalized):
            found.append(concept)

    return _unique_preserve_order(found)


# ============================================================
# 9. CONCEPT EXTRACTION
# ============================================================

def extract_concepts(
    title: str = "",
    abstract: str = "",
    max_concepts: int = 25
) -> List[str]:
    """
    Extract meaningful technical concepts from a patent.

    Priority:
        1. Strong technical phrases
        2. Medium technical phrases
        3. Supporting concepts

    Generic words are deliberately excluded.
    """

    combined_text = f"{title} {abstract}".strip()

    if not combined_text:
        return []

    known_concepts = extract_known_technical_concepts(combined_text)

    supporting_concepts = extract_supporting_concepts(combined_text)

    concepts = []

    # Add known technical concepts first.
    for concept in known_concepts:
        if concept not in concepts:
            concepts.append(concept)

    # Add supporting concepts afterward.
    for concept in supporting_concepts:
        if concept not in concepts:
            concepts.append(concept)

    return concepts[:max_concepts]


# ============================================================
# 10. TOKEN-LEVEL TECHNICAL MATCHING
# ============================================================

def _concept_tokens(concept: str) -> Set[str]:
    """
    Convert a concept into normalized tokens while removing
    generic terms.
    """

    normalized = normalize_phrase(concept)

    tokens = set(normalized.split())

    tokens = {
        token
        for token in tokens
        if token not in GENERIC_TERMS
        and token not in GENERIC_DOMAIN_TERMS
    }

    return tokens


def _token_similarity(concept_a: str, concept_b: str) -> float:
    """
    Calculate Jaccard similarity between concept tokens.
    """

    a = _concept_tokens(concept_a)
    b = _concept_tokens(concept_b)

    if not a or not b:
        return 0.0

    intersection = len(a.intersection(b))
    union = len(a.union(b))

    if union == 0:
        return 0.0

    return intersection / union


# ============================================================
# 11. TECHNICAL CONCEPT MATCHING
# ============================================================

def _concept_match_strength(
    user_concept: str,
    patent_concept: str
) -> float:
    """
    Determine how strongly two concepts match.

    Priority:
        exact match
        -> same technical family
        -> token similarity
    """

    a = normalize_phrase(user_concept)
    b = normalize_phrase(patent_concept)

    if not a or not b:
        return 0.0

    # Exact match.
    if a == b:
        return 1.0

    # Same technical family.
    family_a = get_concept_family(a)
    family_b = get_concept_family(b)

    if family_a and family_b and family_a == family_b:
        return 0.90

    # Token-level similarity.
    token_score = _token_similarity(a, b)

    # Require meaningful overlap.
    if token_score >= 0.50:
        return token_score

    return 0.0


# ============================================================
# 12. WEIGHTED CONCEPT OVERLAP
# ============================================================

def calculate_concept_overlap(
    user_concepts: List[str],
    patent_concepts: List[str]
) -> float:
    """
    Calculate weighted technical concept overlap.

    Returns a score from 0 to 100.

    Important:
    Generic concepts do not dominate the score.

    Strong concepts contribute more than supporting concepts.
    """

    if not user_concepts or not patent_concepts:
        return 0.0

    total_user_weight = 0.0
    matched_weight = 0.0

    used_patent_concepts = set()

    for user_concept in user_concepts:

        normalized_user = normalize_phrase(user_concept)

        # Skip generic concepts.
        if _is_generic_concept(normalized_user):
            continue

        weight = get_concept_weight(normalized_user)

        if weight <= 0:
            continue

        total_user_weight += weight

        best_match = 0.0
        best_index = None

        for index, patent_concept in enumerate(patent_concepts):

            if index in used_patent_concepts:
                continue

            strength = _concept_match_strength(
                normalized_user,
                patent_concept
            )

            if strength > best_match:
                best_match = strength
                best_index = index

        if best_match > 0:
            matched_weight += weight * best_match

            if best_index is not None:
                used_patent_concepts.add(best_index)

    if total_user_weight == 0:
        return 0.0

    score = (matched_weight / total_user_weight) * 100.0

    return round(min(score, 100.0), 2)


# ============================================================
# 13. CONCEPT WEIGHT LOOKUP
# ============================================================

def get_concept_weight(concept: str) -> float:
    """
    Return the configured technical importance of a concept.
    """

    normalized = normalize_phrase(concept)

    if not normalized:
        return 0.0

    if _is_generic_concept(normalized):
        return 0.0

    # Direct dictionary lookup.
    if normalized in CONCEPT_WEIGHTS:
        return CONCEPT_WEIGHTS[normalized]

    # Try family representative.
    family = get_concept_family(normalized)

    if family:
        representative = _family_representative_phrase(family)

        if representative in CONCEPT_WEIGHTS:
            return CONCEPT_WEIGHTS[representative]

    # Unknown concepts should not automatically become
    # high-value technical concepts.
    return 0.25


# ============================================================
# 14. GENERIC CONCEPT CHECK
# ============================================================

def _is_generic_concept(concept: str) -> bool:
    """
    Determine whether a concept is too generic to contribute
    meaningful technical relevance.
    """

    normalized = normalize_phrase(concept)

    if not normalized:
        return True

    # Direct generic phrase check.
    if normalized in GENERIC_DOMAIN_TERMS:
        return True

    if normalized in GENERIC_TERMS:
        return True

    # Token-level check.
    tokens = normalized.split()

    if len(tokens) == 1 and tokens[0] in GENERIC_TERMS:
        return True

    if len(tokens) == 1 and tokens[0] in GENERIC_DOMAIN_TERMS:
        return True

    # Artificial intelligence by itself describes an approach,
    # not the specific technical mechanism.
    if normalized in {
        "artificial intelligence",
        "machine learning",
        "deep learning",
        "ai",
        "ml",
    }:
        return True

    # Generic traffic/vehicle combinations.
    if normalized in {
        "analyze traffic",
        "analyse traffic",
        "detect vehicle",
        "vehicle detection",
    }:
        # vehicle detection is handled through the technical
        # family when explicitly extracted.
        return normalized in {
            "analyze traffic",
            "analyse traffic",
            "detect vehicle",
        }

    return False


# ============================================================
# 15. MATCHING CONCEPTS
# ============================================================

def get_matching_concepts(
    user_concepts: List[str],
    patent_concepts: List[str]
) -> List[str]:
    """
    Return the user's technical concepts that have a meaningful
    match in the patent.
    """

    matches = []

    for user_concept in user_concepts:

        if _is_generic_concept(user_concept):
            continue

        best_match = 0.0

        for patent_concept in patent_concepts:

            strength = _concept_match_strength(
                user_concept,
                patent_concept
            )

            best_match = max(best_match, strength)

        if best_match >= 0.50:
            matches.append(user_concept)

    return _unique_preserve_order(matches)


# ============================================================
# 16. DIFFERENT CONCEPTS
# ============================================================

def calculate_different_concepts(
    user_concepts: List[str],
    patent_concepts: List[str]
) -> List[str]:
    """
    Identify meaningful technical concepts present in the
    patent but not sufficiently represented in the user's
    invention.
    """

    differences = []

    for patent_concept in patent_concepts:

        if _is_generic_concept(patent_concept):
            continue

        best_match = 0.0

        for user_concept in user_concepts:

            strength = _concept_match_strength(
                user_concept,
                patent_concept
            )

            best_match = max(best_match, strength)

        if best_match < 0.50:
            differences.append(patent_concept)

    return _unique_preserve_order(differences)


# ============================================================
# 17. TECHNICAL RELEVANCE SCORE
# ============================================================

def calculate_technical_relevance(
    concept_overlap: float,
    abstract_similarity: float,
    title_similarity: float,
    overall_similarity: float
) -> float:
    """
    Calculate the final technical relevance score.

    Weighting:

        45% technical concept overlap
        20% abstract similarity
        25% title similarity
        10% overall similarity

    Inputs may be either:
        0-1 decimal values
    or:
        0-100 percentage values

    Output:
        0-100 score
    """

    # Convert decimal similarities to percentages when needed.
    concept = _to_percentage(concept_overlap)
    abstract = _to_percentage(abstract_similarity)
    title = _to_percentage(title_similarity)
    overall = _to_percentage(overall_similarity)

    score = (
        (concept * 0.45)
        + (abstract * 0.20)
        + (title * 0.25)
        + (overall * 0.10)
    )

    return round(min(max(score, 0.0), 100.0), 2)


# ============================================================
# 18. RELEVANCE CLASSIFICATION
# ============================================================

def classify_technical_relevance(score: float) -> str:
    """
    Convert technical relevance score into a project-level
    interpretation.

    These thresholds are NOT legal patent thresholds.
    """

    score = float(score)

    if score >= 70:
        return "HIGH"

    if score >= 45:
        return "MODERATE"

    if score >= 25:
        return "LOW"

    return "VERY LOW"


# ============================================================
# 19. TEXT SIMILARITY HELPER
# ============================================================

def _to_percentage(value: float) -> float:
    """
    Convert a decimal similarity to percentage.

    Examples:
        0.3915 -> 39.15
        39.15  -> 39.15
    """

    try:
        value = float(value)
    except (TypeError, ValueError):
        return 0.0

    if value <= 1.0:
        return value * 100.0

    return value


# ============================================================
# 20. UNIQUE ORDER-PRESERVING HELPER
# ============================================================

def _unique_preserve_order(items: List[str]) -> List[str]:
    """
    Remove duplicates while preserving original order.
    """

    seen = set()
    result = []

    for item in items:

        normalized = normalize_phrase(item)

        if not normalized:
            continue

        if normalized in seen:
            continue

        seen.add(normalized)
        result.append(item)

    return result


# ============================================================
# 21. CONCEPT DETAILS
# ============================================================

def get_concept_details(
    concepts: List[str]
) -> List[Dict[str, object]]:
    """
    Return detailed information about extracted concepts.

    Useful for debugging and future frontend explanation.
    """

    details = []

    for concept in concepts:

        normalized = normalize_phrase(concept)

        details.append({
            "concept": concept,
            "normalized": normalized,
            "weight": get_concept_weight(normalized),
            "family": get_concept_family(normalized),
            "generic": _is_generic_concept(normalized),
        })

    return details


# ============================================================
# 22. DEBUG / ANALYSIS FUNCTION
# ============================================================

def analyze_concept_relationship(
    user_concepts: List[str],
    patent_concepts: List[str]
) -> Dict[str, object]:
    """
    Produce a detailed technical concept comparison.

    Useful when testing the concept layer from PowerShell.
    """

    matching = get_matching_concepts(
        user_concepts,
        patent_concepts
    )

    different = calculate_different_concepts(
        user_concepts,
        patent_concepts
    )

    overlap = calculate_concept_overlap(
        user_concepts,
        patent_concepts
    )

    return {
        "userConcepts": user_concepts,
        "patentConcepts": patent_concepts,
        "matchingConcepts": matching,
        "differentConcepts": different,
        "conceptOverlap": overlap,
        "userConceptDetails": get_concept_details(user_concepts),
        "patentConceptDetails": get_concept_details(patent_concepts),
    }


# ============================================================
# 23. SAFE PUBLIC API
# ============================================================

__all__ = [
    "extract_concepts",
    "calculate_concept_overlap",
    "calculate_technical_relevance",
    "classify_technical_relevance",
    "calculate_different_concepts",
    "get_matching_concepts",
    "get_concept_details",
    "analyze_concept_relationship",
    "get_concept_weight",
]