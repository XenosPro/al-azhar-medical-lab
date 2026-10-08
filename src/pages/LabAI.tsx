import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./LabAI.css";

const API_URL =
  import.meta.env.VITE_AI_SERVICE_URL || "http://127.0.0.1:8001";

type FormState = Record<string, string>;

type ScreeningResult = {
  prediction: string;
  probabilities: Record<string, number>;
  message: string;
};

const initialForm: FormState = {
  age: "",
  bp: "",
  sg: "",
  al: "",
  su: "",
  rbc: "",
  pc: "",
  pcc: "",
  ba: "",
  bgr: "",
  bu: "",
  sc: "",
  sod: "",
  pot: "",
  hemo: "",
  pcv: "",
  wbcc: "",
  rbcc: "",
  htn: "",
  dm: "",
  cad: "",
  appet: "",
  pe: "",
  ane: "",
};

const numericFields = new Set([
  "age",
  "bp",
  "sg",
  "al",
  "su",
  "bgr",
  "bu",
  "sc",
  "sod",
  "pot",
  "hemo",
  "pcv",
  "wbcc",
  "rbcc",
]);

const fieldLabels: Record<string, string> = {
  age: "Age",
  bp: "Blood pressure",
  sg: "Specific gravity",
  al: "Albumin",
  su: "Sugar",
  rbc: "Red blood cells",
  pc: "Pus cells",
  pcc: "Pus cell clumps",
  ba: "Bacteria",
  bgr: "Blood glucose",
  bu: "Blood urea",
  sc: "Serum creatinine",
  sod: "Sodium",
  pot: "Potassium",
  hemo: "Hemoglobin",
  pcv: "Packed cell volume",
  wbcc: "White blood cell count",
  rbcc: "Red blood cell count",
  htn: "Hypertension",
  dm: "Diabetes mellitus",
  cad: "Coronary artery disease",
  appet: "Appetite",
  pe: "Pedal edema",
  ane: "Anemia",
};

/*
 * Compact reference hints displayed below applicable fields.
 * These are contextual examples, not diagnostic cutoffs.
 */
const referenceHints: Record<string, string> = {
  bp: "Blood pressure varies with age and clinical context.",
  sg: "Dataset values: 1.005–1.025.",
  al: "Dataset grades: 0–5.",
  su: "Dataset grades: 0–5.",
  bgr: "Fasting adult glucose is typically 70–99 mg/dL.",
  bu: "Reference range depends on the laboratory and method.",
  sc: "Typical adult range: approximately 0.6–1.3 mg/dL.",
  sod: "Typical range: 135–145 mEq/L.",
  pot: "Typical range: 3.7–5.2 mEq/L.",
  hemo: "Typical adult range varies by sex: approximately 12.1–17.2 g/dL.",
  pcv: "Adult reference range varies by sex and laboratory.",
  wbcc: "Typical range: 4,000–11,000 cells/µL.",
  rbcc: "Typical adult range varies by sex: approximately 3.8–5.7 million/µL.",
};

const options: Record<string, string[]> = {
  rbc: ["normal", "abnormal"],
  pc: ["normal", "abnormal"],
  pcc: ["present", "notpresent"],
  ba: ["present", "notpresent"],
  htn: ["yes", "no"],
  dm: ["yes", "no"],
  cad: ["yes", "no"],
  appet: ["good", "poor"],
  pe: ["yes", "no"],
  ane: ["yes", "no"],
};

function toNumber(value: string) {
  if (value.trim() === "") return null;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function prettyLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function probabilityPercent(
  probabilities: Record<string, number>,
  candidates: string[],
) {
  const key = Object.keys(probabilities).find((item) =>
    candidates.includes(item.toLowerCase()),
  );

  return key ? Math.round(probabilities[key] * 100) : 0;
}

export default function LabAI() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!data.session) {
        navigate("/login");
        return;
      }

      setCheckingAuth(false);
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const updateField = (name: string, value: string) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const payload = useMemo(() => {
    const output: Record<string, string | number | null> = {};

    Object.entries(form).forEach(([key, value]) => {
      output[key] = numericFields.has(key)
        ? toNumber(value)
        : value || null;
    });

    return output;
  }, [form]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/screen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data?.detail)) {
          const validationMessage = data.detail
            .map((item: { msg?: string }) => item.msg)
            .filter(Boolean)
            .join(" ");

          throw new Error(
            validationMessage || "Invalid laboratory data.",
          );
        }

        throw new Error(
          data?.detail ||
            "The AI service could not process the request.",
        );
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to connect to the AI service.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setResult(null);
    setError("");
  };

  const ckdProbability = result
    ? probabilityPercent(result.probabilities, [
        "ckd",
        "yes",
        "positive",
      ])
    : 0;

  const notCkdProbability = result
    ? probabilityPercent(result.probabilities, [
        "notckd",
        "not ckd",
        "no",
        "negative",
      ])
    : 0;

  const isPositive =
    result?.prediction?.toLowerCase() === "ckd" ||
    result?.prediction?.toLowerCase() === "positive";

  const renderNumberField = (name: string) => (
    <label className="lab-field" key={name}>
      <span>{fieldLabels[name]}</span>

      <input
        type="number"
        step="any"
        value={form[name]}
        onChange={(event) =>
          updateField(name, event.target.value)
        }
        placeholder="Optional"
      />

      {referenceHints[name] && (
        <small className="lab-field-hint">
          {referenceHints[name]}
        </small>
      )}
    </label>
  );

  const renderSelectField = (name: string) => (
    <label className="lab-field" key={name}>
      <span>{fieldLabels[name]}</span>

      <select
        value={form[name]}
        onChange={(event) =>
          updateField(name, event.target.value)
        }
      >
        <option value="">Not provided</option>

        {options[name].map((option) => (
          <option key={option} value={option}>
            {prettyLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );

  if (checkingAuth) {
    return (
      <main className="lab-ai-page lab-ai-loading">
        <div className="lab-ai-loading-card">
          <span className="lab-ai-spinner" />
          <p>Checking secure session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="lab-ai-page">
      ```
 
      
{/* HERO — PROFESSIONAL MEDICAL AI */}
<section className="lab-ai-hero lab-ai-hero-v3">
  <div className="lab-ai-v3-glow" aria-hidden="true" />

  <div className="lab-ai-container lab-ai-v3-container">
    <nav className="lab-ai-v3-breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <span aria-hidden="true">/</span>
      <span>Laboratory AI</span>
    </nav>

    <div className="lab-ai-v3-layout">
      <div className="lab-ai-v3-copy">
        <div className="lab-ai-v3-eyebrow">
          <span className="lab-ai-v3-eyebrow-mark" />
          CLINICAL INTELLIGENCE PLATFORM
        </div>

        <h1 className="lab-ai-v3-title">
          Laboratory data.
          <br />
          <span>Intelligent screening.</span>
        </h1>

        <p className="lab-ai-v3-description">
          Transform laboratory and clinical parameters into
          machine-learning insights to support chronic kidney
          disease screening.
        </p>

        <div className="lab-ai-v3-divider" />

        <div className="lab-ai-v3-capabilities">
          <div className="lab-ai-v3-capability">
            <span className="lab-ai-v3-check" aria-hidden="true">✓</span>
            <span>Random Forest model</span>
          </div>

          <div className="lab-ai-v3-capability">
            <span className="lab-ai-v3-check" aria-hidden="true">✓</span>
            <span>24 laboratory and clinical features</span>
          </div>

          <div className="lab-ai-v3-capability">
            <span className="lab-ai-v3-check" aria-hidden="true">✓</span>
            <span>Probability-based screening output</span>
          </div>
        </div>

        <p className="lab-ai-v3-note">
          <span aria-hidden="true">ⓘ</span>
          For screening support only. Not a medical diagnosis.
        </p>
      </div>

      <aside
        className="lab-ai-v3-panel"
        aria-label="Screening workflow overview"
      >
        <div className="lab-ai-v3-panel-top">
          <div className="lab-ai-v3-emblem" aria-hidden="true">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 7h12M21 7v12L11 35a4 4 0 0 0 3.5 6h19a4 4 0 0 0 3.5-6L27 19V7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 31h16M19 25h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="24" cy="35" r="2" fill="currentColor" />
            </svg>
          </div>

          <span className="lab-ai-v3-panel-index">
            AI / 01
          </span>
        </div>

        <span className="lab-ai-v3-panel-label">
          SCREENING WORKFLOW
        </span>

        <h2 className="lab-ai-v3-panel-title">
          Laboratory intelligence
        </h2>

        <p className="lab-ai-v3-panel-description">
          A machine-learning approach to interpreting
          structured laboratory and clinical data.
        </p>

        <div className="lab-ai-v3-workflow">
          <div className="lab-ai-v3-workflow-step">
            <span className="lab-ai-v3-step-number">01</span>
            <div>
              <strong>Clinical inputs</strong>
              <span>Laboratory and patient parameters</span>
            </div>
            <span className="lab-ai-v3-step-dot" />
          </div>

          <div className="lab-ai-v3-workflow-step">
            <span className="lab-ai-v3-step-number">02</span>
            <div>
              <strong>Model processing</strong>
              <span>Random Forest classification</span>
            </div>
            <span className="lab-ai-v3-step-dot" />
          </div>

          <div className="lab-ai-v3-workflow-step">
            <span className="lab-ai-v3-step-number">03</span>
            <div>
              <strong>Screening output</strong>
              <span>Predicted class and probabilities</span>
            </div>
            <span className="lab-ai-v3-step-dot" />
          </div>
        </div>

        <div className="lab-ai-v3-panel-footer">
          <span className="lab-ai-v3-info-icon" aria-hidden="true">i</span>
          <span>Decision-support information, not a diagnosis.</span>
        </div>
      </aside>
    </div>

    <div className="lab-ai-v3-bottom-line">
      <span>AL-AZHAR MEDICAL LABORATORY</span>
      <span>LABORATORY AI <span aria-hidden="true">/</span> CKD SCREENING</span>
    </div>
  </div>
</section>
```


      
      {/* MODEL EXPLANATION */}
      <section className="ai-explainer ai-redesign">
        <div className="ai-container">
          <header className="ai-redesign-heading">
            <span className="ai-section-label">
              UNDERSTANDING THE MODEL
            </span>

            <h2>From laboratory data to AI screening</h2>

            <p>
              Explore how laboratory measurements move through the
              machine-learning pipeline to produce a model-indicated
              CKD screening result.
            </p>
          </header>

          <div className="ai-redesign-steps">
            <article className="ai-redesign-step">
              <span className="ai-redesign-number">01</span>
              <span className="ai-redesign-kicker">INPUT</span>
              <h3>Laboratory data</h3>
              <p>
                Patient measurements, blood tests, urinalysis and
                clinical history.
              </p>

              <div className="ai-redesign-tags">
                <span>Creatinine</span>
                <span>Hemoglobin</span>
                <span>Glucose</span>
                <span>Blood pressure</span>
              </div>
            </article>

            <article className="ai-redesign-step">
              <span className="ai-redesign-number">02</span>
              <span className="ai-redesign-kicker">PREPARATION</span>
              <h3>Data processing</h3>
              <p>
                The preprocessing pipeline prepares submitted values
                for the trained model.
              </p>

              <ul className="ai-redesign-list">
                <li>Numeric values</li>
                <li>Categorical values</li>
                <li>Missing-value handling</li>
              </ul>
            </article>

            <article className="ai-redesign-step ai-redesign-step-featured">
              <span className="ai-redesign-number">03</span>
              <span className="ai-redesign-kicker">MACHINE LEARNING</span>
              <h3>Random Forest</h3>
              <p>
                Multiple decision trees contribute to a combined
                prediction.
              </p>

              <div className="ai-redesign-forest" aria-label="Illustration of decision trees">
                {Array.from({ length: 12 }, (_, index) => (
                  <span key={index} className="ai-redesign-tree">
                    <i />
                    <i />
                    <i />
                  </span>
                ))}
              </div>

              <div className="ai-redesign-model-caption">
                <strong>Ensemble model</strong>
                <span>Many trees. One prediction.</span>
              </div>
            </article>

            <article className="ai-redesign-step">
              <span className="ai-redesign-number">04</span>
              <span className="ai-redesign-kicker">OUTPUT</span>
              <h3>Screening probabilities</h3>
              <p>
                The model returns a predicted class and its class
                probabilities.
              </p>

              <div className="ai-redesign-output-tags">
                <span>CKD</span>
                <span>NOT CKD</span>
              </div>
            </article>
          </div>

          <section className="ai-redesign-live">
            <div className="ai-redesign-live-heading">
              <div>
                <span className="ai-section-label">MODEL OUTPUT</span>
                <h3>Screening result overview</h3>
              </div>

              <span
                className={`ai-redesign-status ${
                  result ? "has-result" : ""
                }`}
              >
                <i />
                {result ? "Result available" : "Waiting for input"}
              </span>
            </div>

            <div className="ai-redesign-live-grid">
              <div className="ai-redesign-live-intro">
                <span className="ai-redesign-live-icon">AI</span>

                <h4>
                  {result
                    ? `${isPositive ? "CKD" : "NOT CKD"} classification`
                    : "Your result will appear here"}
                </h4>

                <p>
                  {result
                    ? "These probabilities represent the trained model's output, not a confirmed diagnosis."
                    : "Submit laboratory data using the form below to display the model's actual output."}
                </p>
              </div>

              <div className="ai-redesign-probabilities">
                <div className="ai-redesign-probability">
                  <div className="ai-redesign-probability-label">
                    <span>CKD probability</span>
                    <strong>
                      {result ? `${ckdProbability}%` : "—"}
                    </strong>
                  </div>

                  <div className="ai-redesign-track">
                    <span
                      style={{
                        width: `${result ? ckdProbability : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="ai-redesign-probability">
                  <div className="ai-redesign-probability-label">
                    <span>NOT CKD probability</span>
                    <strong>
                      {result ? `${notCkdProbability}%` : "—"}
                    </strong>
                  </div>

                  <div className="ai-redesign-track ai-redesign-track-secondary">
                    <span
                      style={{
                        width: `${result ? notCkdProbability : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="ai-redesign-model-note">
              <span aria-hidden="true">i</span>
              <p>
                <strong>Model explanation:</strong> the tree illustration
                is conceptual. The probability bars display the returned
                model output when a screening result is available.
              </p>
            </div>
          </section>

          <div className="ai-redesign-disclaimer">
            <span aria-hidden="true">!</span>
            <p>
              <strong>Screening support, not diagnosis.</strong> This
              tool does not replace professional clinical evaluation
              or a healthcare professional's interpretation of
              laboratory results.
            </p>
          </div>
        </div>
      </section>

      {/* INPUT FORM */}
      <section className="lab-ai-form-section">
        <div className="lab-ai-container">
          <div className="lab-ai-section-heading">
            <span className="lab-ai-eyebrow">
              LABORATORY SCREENING
            </span>

            <h2>Enter laboratory parameters</h2>

            <p>
              Provide the available values. Fields may be left empty when
              the information is not available.
            </p>
          </div>

          <form className="lab-ai-form" onSubmit={submit}>
            <section className="lab-form-card">
              <div className="lab-form-card-heading">
                <span>01</span>

                <div>
                  <h3>Patient information</h3>
                  <p>Basic patient measurements.</p>
                </div>
              </div>

              <div className="lab-fields-grid">
                {renderNumberField("age")}
                {renderNumberField("bp")}
              </div>
            </section>

            <section className="lab-form-card">
              <div className="lab-form-card-heading">
                <span>02</span>

                <div>
                  <h3>Urinalysis</h3>
                  <p>Urine laboratory parameters.</p>
                </div>
              </div>

              <div className="lab-fields-grid">
                {renderNumberField("sg")}
                {renderNumberField("al")}
                {renderNumberField("su")}
                {renderSelectField("rbc")}
                {renderSelectField("pc")}
                {renderSelectField("pcc")}
                {renderSelectField("ba")}
              </div>
            </section>

            <section className="lab-form-card">
              <div className="lab-form-card-heading">
                <span>03</span>

                <div>
                  <h3>Blood chemistry</h3>
                  <p>Biochemical laboratory parameters.</p>
                </div>
              </div>

              <div className="lab-fields-grid">
                {renderNumberField("bgr")}
                {renderNumberField("bu")}
                {renderNumberField("sc")}
                {renderNumberField("sod")}
                {renderNumberField("pot")}
              </div>
            </section>

            <section className="lab-form-card">
              <div className="lab-form-card-heading">
                <span>04</span>

                <div>
                  <h3>Hematology</h3>
                  <p>Blood cell and hemoglobin measurements.</p>
                </div>
              </div>

              <div className="lab-fields-grid">
                {renderNumberField("hemo")}
                {renderNumberField("pcv")}
                {renderNumberField("wbcc")}
                {renderNumberField("rbcc")}
              </div>
            </section>

            <section className="lab-form-card">
              <div className="lab-form-card-heading">
                <span>05</span>

                <div>
                  <h3>Clinical history</h3>
                  <p>Relevant clinical variables.</p>
                </div>
              </div>

              <div className="lab-fields-grid">
                {renderSelectField("htn")}
                {renderSelectField("dm")}
                {renderSelectField("cad")}
                {renderSelectField("appet")}
                {renderSelectField("pe")}
                {renderSelectField("ane")}
              </div>
            </section>

            {error && (
              <div className="lab-ai-error" role="alert">
                {error}
              </div>
            )}

            <div className="lab-ai-form-actions">
              <button
                type="button"
                className="lab-reset-button"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </button>

              <button
                type="submit"
                className="lab-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="lab-button-spinner" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze laboratory data"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* RESULT */}
      {result && (
        <section className="lab-ai-result-section">
          <div className="lab-ai-container">
            <div className="lab-ai-result-card">
              <div className="lab-result-header">
                <div>
                  <span className="lab-ai-eyebrow">
                    MODEL-INDICATED SCREENING
                  </span>

                  <h2>
                    {isPositive
                      ? "Positive screening indication"
                      : "Negative screening indication"}
                  </h2>
                </div>

                <div
                  className={`lab-result-badge ${
                    isPositive ? "positive" : "negative"
                  }`}
                >
                  {result.prediction}
                </div>
              </div>

              <div className="lab-result-probabilities">
                <div className="lab-result-probability">
                  <div>
                    <span>CKD</span>
                    <strong>{ckdProbability}%</strong>
                  </div>

                  <div className="lab-result-bar">
                    <i
                      style={{
                        width: `${ckdProbability}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="lab-result-probability">
                  <div>
                    <span>NOT CKD</span>
                    <strong>{notCkdProbability}%</strong>
                  </div>

                  <div className="lab-result-bar">
                    <i
                      style={{
                        width: `${notCkdProbability}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="lab-result-message">
                {result.message}
              </p>

              <p className="lab-result-disclaimer">
                This AI system provides machine-learning screening support
                only. It is not a medical diagnosis and should not replace
                professional medical evaluation.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TECHNICAL OVERVIEW */}
      <section className="lab-ai-technical">
        <div className="lab-ai-container">
          <div className="lab-ai-section-heading">
            <span className="lab-ai-eyebrow">
              TECHNICAL OVERVIEW
            </span>

            <h2>How the laboratory AI is built</h2>
          </div>

          <div className="lab-ai-technical-grid">
            <article>
              <span>01</span>
              <h3>Frontend</h3>

              <p>
                React and TypeScript provide the laboratory data interface
                and interactive screening experience.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>API</h3>

              <p>
                FastAPI receives validated laboratory parameters and
                communicates with the trained machine-learning pipeline.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Machine learning</h3>

              <p>
                A Random Forest classifier with 400 decision trees processes
                the prepared laboratory data and returns class probabilities.
              </p>
            </article>

            <article>
              <span>04</span>
              <h3>Clinical context</h3>

              <p>
                Results are presented as screening support and explicitly
                separated from medical diagnosis.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}