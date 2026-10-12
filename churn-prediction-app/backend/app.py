"""Flask API for the churn model. Also serves the built React app if frontend/dist exists."""
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

ROOT = Path(__file__).resolve().parent
DIST = ROOT.parent / "frontend" / "dist"
MODEL_PATH = ROOT / "model.joblib"

if not MODEL_PATH.exists():
    raise SystemExit("model.joblib not found. Run:  python train_model.py")

bundle = joblib.load(MODEL_PATH)
model = bundle["model"]
COLUMNS = bundle["columns"]
NUMERIC = bundle["numeric_cols"]
CATEGORIES = bundle["categories"]

app = Flask(__name__, static_folder=None)
CORS(app)


def validate(payload):
    """Return (clean_row_dict, errors_dict)."""
    row, errors = {}, {}
    for col in NUMERIC:
        try:
            val = float(payload.get(col))
            if val < 0:
                raise ValueError
            row[col] = val
        except (TypeError, ValueError):
            errors[col] = "must be a non-negative number"
    for col, allowed in CATEGORIES.items():
        val = payload.get(col)
        if val not in allowed:
            errors[col] = f"must be one of {allowed}"
        else:
            row[col] = val
    return row, errors


def encode(row):
    df = pd.DataFrame([row])
    for col, allowed in CATEGORIES.items():
        df[col] = pd.Categorical(df[col], categories=allowed)
    enc = pd.get_dummies(df, columns=list(CATEGORIES), drop_first=True)
    return enc.reindex(columns=COLUMNS, fill_value=0).astype(float)


@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.get("/api/model-info")
def model_info():
    return jsonify(
        model="Random Forest",
        metrics=bundle["metrics"],
        top_features=bundle["top_features"],
    )


@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    row, errors = validate(payload)
    if errors:
        return jsonify(error="Invalid input", fields=errors), 400

    proba = float(model.predict_proba(encode(row))[0][1])
    risk = "Low" if proba < 0.3 else "Medium" if proba < 0.6 else "High"
    return jsonify(
        prediction="Churn" if proba >= 0.5 else "No Churn",
        churn_probability=round(proba, 4),
        risk_level=risk,
    )


@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def frontend(path):
    if DIST.exists():
        target = DIST / path
        if path and target.is_file():
            return send_from_directory(DIST, path)
        return send_from_directory(DIST, "index.html")
    return jsonify(message="API running. Start the frontend with `npm run dev` in /frontend.")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
