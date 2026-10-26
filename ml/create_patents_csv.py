import json
import glob
import pandas as pd
import os

input_folder = "ml/data/hupd_sample"
output_file = "ml/data/patents.csv"

files = glob.glob(
    os.path.join(input_folder, "**", "*.json"),
    recursive=True
)

print("Patent files found:", len(files))

rows = []

for index, file in enumerate(files, start=1):
    try:
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)

        patent_id = data.get("patent_number", "")
        title = data.get("title", "")
        abstract = data.get("abstract", "")

        if not patent_id or not title or not abstract:
            continue

        if isinstance(abstract, list):
            abstract = " ".join(str(x) for x in abstract)

        rows.append({
            "patent_id": str(patent_id),
            "title": str(title).strip(),
            "abstract": str(abstract).strip()
        })

        if index % 1000 == 0:
            print("Processed:", index)

    except Exception as e:
        print("Error:", file, e)

df = pd.DataFrame(rows)

df = df.drop_duplicates(subset=["patent_id"])

df = df[
    (df["title"].str.len() > 0) &
    (df["abstract"].str.len() > 0)
]

df.to_csv(output_file, index=False, encoding="utf-8")

print()
print("Dataset creation completed")
print("Patent records:", len(df))
print("Columns:", list(df.columns))
print("Output:", output_file)
print()
print(df.head(5).to_string(index=False))