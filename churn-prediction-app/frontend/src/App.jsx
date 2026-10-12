import { useEffect, useState } from "react";
import { ADDON_FIELDS, DEFAULTS, PRESETS, SECTIONS } from "./config.js";

const API = import.meta.env.VITE_API_URL || "";

function applyDependencies(form, changed) {
  const next = { ...form };

  if (changed === "PhoneService") {
    if (next.PhoneService === "No") next.MultipleLines = "No phone service";
    else if (next.MultipleLines === "No phone service") next.MultipleLines = "No";
  }
  if (changed === "InternetService") {
    if (next.InternetService === "No") {
      ADDON_FIELDS.forEach((f) => (next[f] = "No internet service"));
    } else {
      ADDON_FIELDS.forEach((f) => {
        if (next[f] === "No internet service") next[f] = "No";
      });
    }
  }
  return next;
}

function Field({ field, value, disabled, onChange }) {
  return (
    <label className="field">
      <span>{field.label}</span>
      {field.options ? (
        <select value={value} disabled={disabled} onChange={(e) => onChange(field.name, e.target.value)}>
          {field.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          value={value}
          min={field.min}
          max={field.max}
          step={field.step}
          required
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}
    </label>
  );
}

export default function App() {
  const [form, setForm] = useState(DEFAULTS);
  const [totalTouched, setTotalTouched] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/model-info`)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  const handleChange = (name, value) => {
    const touched = totalTouched || name === "TotalCharges";
    if (name === "TotalCharges") setTotalTouched(true);
    setForm((prev) => {
      const next = applyDependencies({ ...prev, [name]: value }, name);
      if ((name === "tenure" || name === "MonthlyCharges") && !touched) {
        next.TotalCharges = Math.round(Number(next.tenure) * Number(next.MonthlyCharges) * 100) / 100;
      }
      return next;
    });
  };

  const loadPreset = (name) => {
    setForm(PRESETS[name]);
    setTotalTouched(false);
    setResult(null);
    setError("");
  };

  const isDisabled = (name) =>
    (name === "MultipleLines" && form.PhoneService === "No") ||
    (ADDON_FIELDS.includes(name) && form.InternetService === "No");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        tenure: Number(form.tenure),
        MonthlyCharges: Number(form.MonthlyCharges),
        TotalCharges: Number(form.TotalCharges),
      };
      const res = await fetch(`${API}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(
        err instanceof TypeError
          ? "Cannot reach the API. Make sure the backend is running (python app.py in /backend)."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const pct = result ? Math.round(result.churn_probability * 100) : 0;
  const tone = result ? result.risk_level.toLowerCase() : "";

  return (
    <div className="page">
      <header>
        <h1>Customer Churn Predictor</h1>
        <p>Enter a telecom customer's details to estimate whether they are likely to leave.</p>
      </header>

      <div className="layout">
        <form className="card" onSubmit={submit}>
          <div className="presets">
            <span>Load example:</span>
            {Object.keys(PRESETS).map((p) => (
              <button type="button" key={p} className="chip" onClick={() => loadPreset(p)}>
                {p}
              </button>
            ))}
          </div>

          {SECTIONS.map((section) => (
            <fieldset key={section.title}>
              <legend>{section.title}</legend>
              <div className="grid">
                {section.fields.map((f) => (
                  <Field
                    key={f.name}
                    field={f}
                    value={form[f.name]}
                    disabled={isDisabled(f.name)}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </fieldset>
          ))}

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Predicting…" : "Predict churn"}
          </button>
        </form>

        <aside>
          <div className={`card result ${tone}`}>
            <h2>Prediction</h2>
            {error && <p className="error">{error}</p>}
            {!result && !error && <p className="muted">Submit the form to see a prediction.</p>}
            {result && (
              <>
                <div className="verdict">{result.prediction}</div>
                <div className="meter" aria-label={`Churn probability ${pct}%`}>
                  <div className="fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="stats">
                  <div>
                    <strong>{pct}%</strong>
                    <span>churn probability</span>
                  </div>
                  <div>
                    <strong>{result.risk_level}</strong>
                    <span>risk level</span>
                  </div>
                </div>
                <p className="muted small">
                  Predicted as churn when probability is 50% or higher. Risk: Low &lt; 30%, Medium 30–60%, High ≥ 60%.
                </p>
              </>
            )}
          </div>

          {info && (
            <div className="card">
              <h2>About the model</h2>
              <p className="muted small">{info.model}, evaluated on a held-out 20% test set.</p>
              <table>
                <tbody>
                  {Object.entries(info.metrics).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k.replace("_", "-").toUpperCase()}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
