const YES_NO = ["Yes", "No"];
const ADDON = ["Yes", "No", "No internet service"];

// Form layout. Option values must match the dataset's categories exactly.
export const SECTIONS = [
  {
    title: "Account",
    fields: [
      { name: "tenure", label: "Tenure (months)", type: "number", min: 0, max: 120, step: 1 },
      { name: "Contract", label: "Contract", options: ["Month-to-month", "One year", "Two year"] },
      { name: "PaperlessBilling", label: "Paperless billing", options: YES_NO },
      {
        name: "PaymentMethod",
        label: "Payment method",
        options: ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"],
      },
      { name: "MonthlyCharges", label: "Monthly charges ($)", type: "number", min: 0, step: 0.05 },
      { name: "TotalCharges", label: "Total charges ($)", type: "number", min: 0, step: 0.05 },
    ],
  },
  {
    title: "Customer",
    fields: [
      { name: "gender", label: "Gender", options: ["Female", "Male"] },
      { name: "SeniorCitizen", label: "Senior citizen", options: ["No", "Yes"] },
      { name: "Partner", label: "Has partner", options: YES_NO },
      { name: "Dependents", label: "Has dependents", options: YES_NO },
    ],
  },
  {
    title: "Services",
    fields: [
      { name: "PhoneService", label: "Phone service", options: YES_NO },
      { name: "MultipleLines", label: "Multiple lines", options: ["Yes", "No", "No phone service"] },
      { name: "InternetService", label: "Internet service", options: ["DSL", "Fiber optic", "No"] },
      { name: "OnlineSecurity", label: "Online security", options: ADDON },
      { name: "OnlineBackup", label: "Online backup", options: ADDON },
      { name: "DeviceProtection", label: "Device protection", options: ADDON },
      { name: "TechSupport", label: "Tech support", options: ADDON },
      { name: "StreamingTV", label: "Streaming TV", options: ADDON },
      { name: "StreamingMovies", label: "Streaming movies", options: ADDON },
    ],
  },
];

export const ADDON_FIELDS = [
  "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
];

export const PRESETS = {
  "Loyal customer": {
    gender: "Female", SeniorCitizen: "No", Partner: "Yes", Dependents: "Yes", tenure: 60,
    PhoneService: "Yes", MultipleLines: "Yes", InternetService: "DSL", OnlineSecurity: "Yes",
    OnlineBackup: "Yes", DeviceProtection: "Yes", TechSupport: "Yes", StreamingTV: "No",
    StreamingMovies: "No", Contract: "Two year", PaperlessBilling: "No",
    PaymentMethod: "Bank transfer (automatic)", MonthlyCharges: 65, TotalCharges: 3900,
  },
  "At-risk customer": {
    gender: "Male", SeniorCitizen: "No", Partner: "No", Dependents: "No", tenure: 2,
    PhoneService: "Yes", MultipleLines: "No", InternetService: "Fiber optic", OnlineSecurity: "No",
    OnlineBackup: "No", DeviceProtection: "No", TechSupport: "No", StreamingTV: "Yes",
    StreamingMovies: "Yes", Contract: "Month-to-month", PaperlessBilling: "Yes",
    PaymentMethod: "Electronic check", MonthlyCharges: 95, TotalCharges: 190,
  },
};

export const DEFAULTS = PRESETS["At-risk customer"];
