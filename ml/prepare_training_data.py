import pandas as pd

patent_file = "ml/data/patents.csv"
metadata_file = "ml/data/hupd_metadata.feather"
output_file = "ml/data/patents_with_cpc.csv"

patents = pd.read_csv(patent_file)
metadata = pd.read_feather(metadata_file)

def normalize_id(value):
    if pd.isna(value):
        return ""

    value = str(value).strip()

    if value.endswith(".0"):
        value = value[:-2]

    return value

patents["patent_id"] = patents["patent_id"].apply(normalize_id)

metadata["patent_number"] = metadata["patent_number"].apply(normalize_id)

metadata = metadata[
    ["patent_number", "main_cpc_label"]
].copy()

metadata = metadata.rename(
    columns={
        "patent_number": "patent_id",
        "main_cpc_label": "cpc_label"
    }
)

metadata = metadata.dropna(subset=["cpc_label"])

metadata = metadata[
    metadata["cpc_label"].astype(str).str.strip() != ""
]

metadata = metadata.drop_duplicates(
    subset=["patent_id"]
)

df = patents.merge(
    metadata,
    on="patent_id",
    how="inner"
)

df = df.dropna(subset=["cpc_label"])

df.to_csv(
    output_file,
    index=False
)

print("Training dataset preparation completed")
print("Patent records:", len(df))
print("Columns:", list(df.columns))
print("Unique CPC labels:", df["cpc_label"].nunique())
print()

print("Sample records:")
print(
    df[
        ["patent_id", "title", "cpc_label"]
    ].head(10).to_string(index=False)
)

print()
print("Most common CPC labels:")
print(
    df["cpc_label"]
    .value_counts()
    .head(10)
)