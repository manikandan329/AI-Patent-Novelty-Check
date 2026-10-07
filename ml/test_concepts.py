from technical_concepts import (
    extract_concepts,
    calculate_concept_overlap,
    calculate_technical_relevance,
    classify_technical_relevance
)


traffic_patent = """
An AI-based real-time traffic collision avoidance system uses
computer vision and vehicle sensors to detect nearby vehicles
and obstacles. The system analyzes vehicle speed, relative
distance and movement patterns to predict collision risks and
generate warnings for the driver.
"""


uav_patent = """
An autonomous UAV swarm collision avoidance network uses
real-time obstacle detection and trajectory analysis to
recalculate the movement of aerial vehicles and prevent
collisions between UAVs.
"""


glucose_patent = """
A biocompatible graphene glucose sensor array provides
continuous enzymatic biosensing for monitoring glucose and
other biological analytes using functionalized graphene
materials.
"""


traffic_concepts = extract_concepts(traffic_patent)
uav_concepts = extract_concepts(uav_patent)
glucose_concepts = extract_concepts(glucose_patent)


uav_overlap, uav_matches = calculate_concept_overlap(
    traffic_concepts,
    uav_concepts
)


glucose_overlap, glucose_matches = calculate_concept_overlap(
    traffic_concepts,
    glucose_concepts
)


uav_relevance = calculate_technical_relevance(
    uav_overlap,
    74.55,
    68.9,
    71.0
)


glucose_relevance = calculate_technical_relevance(
    glucose_overlap,
    52.5,
    50.0,
    50.0
)


print("TRAFFIC PATENT")
print("----------------------------")
print("Concepts:")
print(traffic_concepts)


print()
print("UAV PATENT")
print("----------------------------")
print("Concepts:")
print(uav_concepts)
print("Concept overlap:", uav_overlap, "%")
print("Matching concepts:", uav_matches)
print("Technical relevance:", uav_relevance, "%")
print(
    "Classification:",
    classify_technical_relevance(uav_relevance)
)


print()
print("GLUCOSE PATENT")
print("----------------------------")
print("Concepts:")
print(glucose_concepts)
print("Concept overlap:", glucose_overlap, "%")
print("Matching concepts:", glucose_matches)
print("Technical relevance:", glucose_relevance, "%")
print(
    "Classification:",
    classify_technical_relevance(glucose_relevance)
)