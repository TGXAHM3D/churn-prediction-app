"""Train the churn model (same pipeline as the notebook) and save it to model.joblib."""
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, f1_score, precision_score,
                             recall_score, roc_auc_score)
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent
DATA = ROOT.parent / "analysis" / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
OUT = ROOT / "model.joblib"

df = pd.read_csv(DATA)

# --- preprocessing (same as notebook) ---
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce").fillna(0)
df["SeniorCitizen"] = df["SeniorCitizen"].map({0: "No", 1: "Yes"})
df = df.drop(columns=["customerID"])

y = df["Churn"].map({"Yes": 1, "No": 0})
X = df.drop(columns=["Churn"])

numeric_cols = ["tenure", "MonthlyCharges", "TotalCharges"]
categorical_cols = [c for c in X.columns if c not in numeric_cols]
categories = {c: sorted(X[c].unique().tolist()) for c in categorical_cols}

# --- encoding (one-hot, drop_first) ---
X_enc = pd.get_dummies(X, columns=categorical_cols, drop_first=True)

X_train, X_test, y_train, y_test = train_test_split(
    X_enc, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(n_estimators=300, max_depth=10, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

pred = model.predict(X_test)
proba = model.predict_proba(X_test)[:, 1]
metrics = {
    "accuracy": round(accuracy_score(y_test, pred), 3),
    "precision": round(precision_score(y_test, pred), 3),
    "recall": round(recall_score(y_test, pred), 3),
    "f1": round(f1_score(y_test, pred), 3),
    "roc_auc": round(roc_auc_score(y_test, proba), 3),
}

importances = (
    pd.Series(model.feature_importances_, index=X_enc.columns)
    .sort_values(ascending=False)
    .head(8)
)

joblib.dump(
    {
        "model": model,
        "columns": X_enc.columns.tolist(),
        "numeric_cols": numeric_cols,
        "categories": categories,
        "metrics": metrics,
        "top_features": {k: round(float(v), 4) for k, v in importances.items()},
    },
    OUT,
    compress=3,
)
print("Saved", OUT, f"({OUT.stat().st_size / 1e6:.1f} MB)")
print("Test metrics:", metrics)
