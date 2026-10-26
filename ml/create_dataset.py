import pandas as pd
import os

input_file = "ml/data/hupd_metadata.feather"
output_file = "ml/data/patents.csv"

df = pd.read_feather(input_file)

print("Original columns:")
print(df.columns.tolist())

print("Original rows:", len(df))

required_columns = ["patent_number", "title", "abstract"]

missing = [column for column in required_columns if column not in df.columns]

if missing:
    print("Missing columns:", missing)
    raise SystemExit

df = df[required_columns].copy()

df = df.rename(columns={
    "patent_number": "patent_id"
})

df["title"] = df["title"].fillna("").astype(str)
df["abstract"] = df["abstract"].fillna("").astype(str)
df["patent_id"] = df["patent_id"].fillna("").astype(str)

df = df[
    (df["title"].str.strip() != "") &
    (df["abstract"].str.strip() != "")
]

df = df.drop_duplicates(subset=["patent_id"])

df.to_csv(output_file, index=False)

print()
print("Dataset created successfully")
print("Number of patents:", len(df))
print("Columns:", df.columns.tolist())
print("Saved to:", output_file)
print()
print(df.head())