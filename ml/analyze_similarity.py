import pandas as pd

train_file = "ml/data/clean_train_pairs.csv"
test_file = "ml/data/clean_test_pairs.csv"

train_df = pd.read_csv(train_file)
test_df = pd.read_csv(test_file)

for name, df in [
    ("Training", train_df),
    ("Testing", test_df)
]:

    print()
    print("=" * 50)
    print(name)
    print("=" * 50)

    positive = df[df["label"] == 1]["similarity"]
    negative = df[df["label"] == 0]["similarity"]

    print()
    print("Positive pairs")
    print("Count :", len(positive))
    print("Mean  :", round(positive.mean(), 4))
    print("Median:", round(positive.median(), 4))
    print("Min   :", round(positive.min(), 4))
    print("Max   :", round(positive.max(), 4))

    print()
    print("Negative pairs")
    print("Count :", len(negative))
    print("Mean  :", round(negative.mean(), 4))
    print("Median:", round(negative.median(), 4))
    print("Min   :", round(negative.min(), 4))
    print("Max   :", round(negative.max(), 4))

    print()
    print("Similarity ranges")

    bins = [
        0.0,
        0.05,
        0.10,
        0.15,
        0.20,
        0.30,
        0.40,
        0.50,
        0.60,
        0.70,
        0.80,
        0.90,
        1.01
    ]

    positive_counts = pd.cut(
        positive,
        bins=bins,
        right=False
    ).value_counts().sort_index()

    negative_counts = pd.cut(
        negative,
        bins=bins,
        right=False
    ).value_counts().sort_index()

    print()
    print("Range        Positive    Negative")

    for interval in positive_counts.index:
        print(
            str(interval),
            "   ",
            positive_counts[interval],
            "        ",
            negative_counts[interval]
        )