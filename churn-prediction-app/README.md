# Customer Churn Predictor

Machine learning project that predicts whether a telecom customer will churn, with a web app on top.

- **Model:** Random Forest trained on the Telco Customer Churn dataset (accuracy 0.80, ROC-AUC 0.84 on a held-out test set)
- **Backend:** Flask API (`/api/predict`, `/api/model-info`, `/api/health`)
- **Frontend:** React + Vite form that sends customer details to the API and shows the churn prediction, probability and risk level

## Structure

```
analysis/    Jupyter notebook, PDF report, dataset, charts
backend/     Flask API + train_model.py (+ trained model.joblib)
frontend/    React (Vite) app
```

## Run it

### 1. Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py            # http://127.0.0.1:5000
```
`model.joblib` is included. To retrain it from the dataset: `python train_model.py`.

### 2. Frontend (development)
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173 (proxies /api to the backend)
```

### Single-server mode (optional)
```bash
cd frontend && npm install && npm run build
cd ../backend && python app.py     # open http://127.0.0.1:5000
```
Flask serves the built frontend from `frontend/dist`.

## API

`POST /api/predict` with JSON:

```json
{
  "gender": "Male", "SeniorCitizen": "No", "Partner": "No", "Dependents": "No",
  "tenure": 2, "PhoneService": "Yes", "MultipleLines": "No",
  "InternetService": "Fiber optic", "OnlineSecurity": "No", "OnlineBackup": "No",
  "DeviceProtection": "No", "TechSupport": "No", "StreamingTV": "Yes",
  "StreamingMovies": "Yes", "Contract": "Month-to-month", "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check", "MonthlyCharges": 95, "TotalCharges": 190
}
```

Response:

```json
{ "prediction": "Churn", "churn_probability": 0.7666, "risk_level": "High" }
```

Invalid or missing fields return HTTP 400 with a per-field error message.

## Analysis

Open `analysis/Customer_Churn_Prediction.ipynb` (run from inside `analysis/`). It covers loading, cleaning, EDA, encoding, three models (Logistic Regression, Decision Tree, Random Forest), evaluation and sample predictions. `analysis/Customer_Churn_Prediction_Report.pdf` is the written report.

## Notes

- The model only learns patterns in this dataset; it shows correlation, not the cause of churn.
- Random Forest and Logistic Regression perform almost identically here; Random Forest was used for its feature importances.
