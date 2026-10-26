import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import os

input_file = "ml/data/patents.csv"
model_dir = "ml/models"

os.makedirs(model_dir, exist_ok=True)

df = pd.read_csv(input_file)

df["title"] = df["title"].fillna("")
df["abstract"] = df["abstract"].fillna("")

df["text"] = df["title"] + " " + df["abstract"]

df["text"] = (
    df["text"]
    .str.lower()
    .str.replace(r"[^a-z0-9\s]", " ", regex=True)
    .str.replace(r"\s+", " ", regex=True)
    .str.strip()
)

vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=10000,
    min_df=2,
    max_df=0.95,
    ngram_range=(1, 2)
)

X = vectorizer.fit_transform(df["text"])

joblib.dump(vectorizer, "ml/models/tfidf_vectorizer.pkl")

print("TF-IDF creation completed")
print("Number of patents:", len(df))
print("Feature matrix shape:", X.shape)
print("Vocabulary size:", len(vectorizer.vocabulary_))
print("Vectorizer saved to: ml/models/tfidf_vectorizer.pkl")