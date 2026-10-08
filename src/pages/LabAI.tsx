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

type ReferenceItem = {
  key: string;
  label: string;
  description: string;
  type: string;
  reference: string;
  unit: string;
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

const referenceGroups: {
  title: string;
  description: string;
  items: ReferenceItem[];
}[] = [
  {
    title: "Patient information",
    description: "Basic measurements used by the model.",
    items: [
      {
        key: "age",
        label: "Age",
        description: "Patient age",
        type: "Numeric",
        reference: "Age-dependent",
        unit: "years",
      },
      {
        key: "bp",
        label: "Blood pressure",
        description: "Blood pressure measurement",
        type: "Numeric",
        reference: "Context-dependent",
        unit: "mmHg",
      },
    ],
  },
  {
    title: "Urinalysis",
    description: "Findings obtained from urine analysis.",
    items: [
      {
        key: "sg",
        label: "Specific gravity",
        description: "Urine concentration",
        type: "Dataset-coded",
        reference: "1.005–1.025",
        unit: "",
      },
      {
        key: "al",
        label: "Albumin",
        description: "Urinary albumin finding",
        type: "Ordinal",
        reference: "0–5 in dataset",
        unit: "grade",
      },
      {
        key: "su",
        label: "Sugar",
        description: "Urinary sugar finding",
        type: "Ordinal",
        reference: "0–5 in dataset",
        unit: "grade",
      },
      {
        key: "rbc",
        label: "Red blood cells",
        description: "RBC finding in urine",
        type: "Categorical",
        reference: "Normal",
        unit: "",
      },
      {
        key: "pc",
        label: "Pus cells",
        description: "Pus-cell finding in urine",
        type: "Categorical",
        reference: "Normal",
        unit: "",
      },
      {
        key: "pcc",
        label: "Pus cell clumps",
        description: "Presence of pus-cell clumps",
        type: "Categorical",
        reference: "Not present",
        unit: "",
      },
      {
        key: "ba",
        label: "Bacteria",
        description: "Bacterial finding in urine",
        type: "Categorical",
        reference: "Not present",
        unit: "",
      },
    ],
  },
  {
    title: "Blood chemistry",
    description: "Biochemical measurements obtained from blood analysis.",
    items: [
      {
        key: "bgr",
        label: "Blood glucose",
        description: "Blood glucose measurement",
        type: "Numeric",
        reference: "Context-dependent",
        unit: "mg/dL",
      },
      {
        key: "bu",
        label: "Blood urea",
        description: "Blood urea measurement",
        type: "Numeric",
        reference: "Lab-dependent",
        unit: "mg/dL",
      },
      {
        key: "sc",
        label: "Serum creatinine",
        description: "Creatinine concentration in blood",
        type: "Numeric",
        reference: "Approx. 0.6–1.3",
        unit: "mg/dL",
      },
      {
        key: "sod",
        label: "Sodium",
        description: "Serum sodium concentration",
        type: "Numeric",
        reference: "135–145",
        unit: "mEq/L",
      },
      {
        key: "pot",
        label: "Potassium",
        description: "Serum potassium concentration",
        type: "Numeric",
        reference: "3.7–5.2",
        unit: "mEq/L",
      },
    ],
  },
  {
    title: "Hematology",
    description: "Blood cell and hemoglobin measurements.",
    items: [
      {
        key: "hemo",
        label: "Hemoglobin",
        description: "Hemoglobin concentration",
        type: "Numeric",
        reference: "Male 13.8–17.2 / Female 12.1–15.1",
        unit: "g/dL",
      },
      {
        key: "pcv",
        label: "Packed cell volume",
        description: "Percentage of blood occupied by red cells",
        type: "Numeric",
        reference: "Adult range varies",
        unit: "%",
      },
      {
        key: "wbcc",
        label: "White blood cell count",
        description: "Number of white blood cells",
        type: "Numeric",
        reference: "Typically 4,000–11,000",
        unit: "cells/µL",
      },
      {
        key: "rbcc",
        label: "Red blood cell count",
        description: "Number of red blood cells",
        type: "Numeric",
        reference: "Male 4.2–5.7 / Female 3.8–5.1",
        unit: "million/µL",
      },
    ],
  },
  {
    title: "Clinical history",
    description: "Patient clinical variables used by the model.",
    items: [
      {
        key: "htn",
        label: "Hypertension",
        description: "History/presence of hypertension",
        type: "Categorical",
        reference: "Yes / No",
        unit: "",
      },
      {
        key: "dm",
        label: "Diabetes mellitus",
        description: "History/presence of diabetes",
        type: "Categorical",
        reference: "Yes / No",
        unit: "",
      },
      {
        key: "cad",
        label: "Coronary artery disease",
        description: "History/presence of CAD",
        type: "Categorical",
        reference: "Yes / No",
        unit: "",
      },
      {
        key: "appet",
        label: "Appetite",
        description: "Reported appetite status",
        type: "Categorical",
        reference: "Good / Poor",
        unit: "",
      },
      {
        key: "pe",
        label: "Pedal edema",
        description: "Presence of pedal edema",
        type: "Categorical",
        reference: "Yes / No",
        unit: "",
      },
      {
        key: "ane",
        label: "Anemia",
        description: "Presence/history of anemia",
        type: "Categorical",
        reference: "Yes / No",
        unit: "",
      },
    ],
  },
];

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
      output[key] = numericFields.has(key) ? toNumber(value) : value || null;
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

          throw new Error(validationMessage || "Invalid laboratory data.");
        }

        throw new Error(
          data?.detail || "The AI service could not process the request.",
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
        onChange={(event) => updateField(name, event.target.value)}
        placeholder="Optional"
      />
    </label>
  );

  const renderSelectField = (name: string) => (
    <label className="lab-field" key={name}>
      <span>{fieldLabels[name]}</span>

      <select
        value={form[name]}
        onChange={(event) => updateField(name, event.target.value)}
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
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="lab-ai-hero">
        <div className="lab-ai-container">
          <div className="lab-ai-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Lab AI</span>
          </div>

          <div className="lab-ai-hero-content">
            <div>
              <span className="lab-ai-eyebrow">
                LABORATORY INTELLIGENCE
              </span>

              <h1>
                Laboratory data.
                <br />
                <span>Machine-learning support.</span>
              </h1>

              <p>
                Submit laboratory and clinical parameters to receive a
                model-indicated CKD screening result powered by a trained
                Random Forest classifier.
              </p>

              <div className="lab-ai-hero-tags">
                <span>Random Forest</span>
                <span>24 model features</span>
                <span>CKD screening</span>
              </div>
            </div>

            <div className="lab-ai-hero-card">
              <div className="lab-ai-hero-card-top">
                <span>MODEL STATUS</span>
                <i />
                <strong>Ready</strong>
              </div>

              <div className="lab-ai-hero-card-line" />

              <div className="lab-ai-hero-card-bottom">
                <span>Output</span>
                <strong>Screening probability</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VISUAL EXPLANATION
          ===================================================== */}

      <section className="ai-explainer">
        <div className="ai-container">
          <div className="ai-explainer-heading">
            <div>
              <span className="ai-section-label">
                UNDERSTANDING THE MODEL
              </span>

              <h2>
                How your laboratory data becomes an AI screening result
              </h2>
            </div>

            <p>
              The system follows a machine-learning pipeline. Your
              laboratory values are transformed into a format the trained
              Random Forest model can evaluate.
            </p>
          </div>

          <div className="ai-pipeline">
            <article className="ai-pipeline-card">
              <div className="ai-pipeline-icon">01</div>

              <div className="ai-pipeline-content">
                <span>INPUT</span>

                <h3>Laboratory data</h3>

                <div className="ai-data-chips">
                  <span>Blood pressure</span>
                  <span>Creatinine</span>
                  <span>Hemoglobin</span>
                  <span>Glucose</span>
                  <span>Urinalysis</span>
                  <span>Clinical history</span>
                </div>

                <p>
                  Available patient and laboratory parameters are entered
                  into the screening form.
                </p>
              </div>
            </article>

            <div className="ai-pipeline-arrow">→</div>

            <article className="ai-pipeline-card">
              <div className="ai-pipeline-icon">02</div>

              <div className="ai-pipeline-content">
                <span>PROCESSING</span>

                <h3>Data preparation</h3>

                <div className="ai-processing-visual">
                  <div>
                    <i />
                    <span>Numeric values</span>
                  </div>

                  <div>
                    <i />
                    <span>Categorical values</span>
                  </div>

                  <div>
                    <i />
                    <span>Missing values</span>
                  </div>
                </div>

                <p>
                  The trained preprocessing pipeline prepares the submitted
                  values for the machine-learning model.
                </p>
              </div>
            </article>

            <div className="ai-pipeline-arrow">→</div>

            <article className="ai-pipeline-card ai-pipeline-model">
              <div className="ai-pipeline-icon">03</div>

              <div className="ai-pipeline-content">
                <span>MODEL</span>

                <h3>Random Forest</h3>

                <div className="ai-trees">
                  <div className="ai-tree">Tree 1</div>
                  <div className="ai-tree">Tree 2</div>
                  <div className="ai-tree">Tree 3</div>
                  <div className="ai-tree">Tree 4</div>
                  <div className="ai-tree">…</div>
                </div>

                <div className="ai-vote">
                  <span>400 decision trees</span>
                  <strong>→</strong>
                  <span>ensemble prediction</span>
                </div>

                <p>
                  Multiple decision trees evaluate the prepared laboratory
                  pattern and contribute to the final ensemble prediction.
                </p>
              </div>
            </article>

            <div className="ai-pipeline-arrow">→</div>

            <article className="ai-pipeline-card ai-pipeline-output">
              <div className="ai-pipeline-icon">04</div>

              <div className="ai-pipeline-content">
                <span>OUTPUT</span>

                <h3>Screening probabilities</h3>

                <div className="ai-demo-probability">
                  <div>
                    <span>CKD</span>
                    <strong>Model output</strong>
                  </div>

                  <div className="ai-demo-bar">
                    <i />
                  </div>

                  <div className="ai-demo-labels">
                    <span>Class probabilities</span>
                    <span>CKD / NOT CKD</span>
                  </div>
                </div>

                <p>
                  The model returns a predicted class together with its
                  probability distribution.
                </p>
              </div>
            </article>
          </div>

          {/* =====================================================
              INTERACTIVE RANDOM FOREST
              ===================================================== */}

          <div className="ai-forest-interactive">
            <div className="ai-forest-heading">
              <div>
                <span className="ai-section-label">
                  INTERACTIVE MODEL VIEW
                </span>

                <h3>How 400 decision trees work together</h3>
              </div>

              <p>
                The Random Forest combines the outputs of hundreds of
                decision trees to produce a single classification and
                probability estimate.
              </p>
            </div>

            <div className="ai-forest-stage">
              <div className="ai-forest-input">
                <span>LABORATORY DATA</span>

                <strong>24 features</strong>

                <small>
                  Blood tests, urinalysis and clinical variables
                </small>

                <div className="ai-forest-input-tags">
                  <span>14 numeric</span>
                  <span>10 categorical</span>
                </div>
              </div>

              <div className="ai-forest-connector">→</div>

              <div className="ai-forest-center">
                <div className="ai-forest-model-card">
                  <div className="ai-forest-model-top">
                    <span>ENSEMBLE MODEL</span>

                    <strong>Random Forest</strong>
                  </div>

                  <div className="ai-forest-tree-cloud">
                    {Array.from({ length: 32 }, (_, index) => (
                      <span
                        key={index}
                        className={`ai-mini-tree ${
                          result ? "active" : ""
                        }`}
                        style={{
                          animationDelay: `${index * 35}ms`,
                        }}
                      >
                        <i />
                        <i />
                        <i />
                      </span>
                    ))}
                  </div>

                  <div className="ai-forest-tree-count">
                    <strong>400</strong>
                    <span>decision trees</span>
                  </div>

                  <div className="ai-forest-model-specs">
                    <span>Max depth 12</span>
                    <span>Balanced classes</span>
                    <span>Min samples 2</span>
                  </div>
                </div>

                <div className="ai-forest-vote">
                  <span>ENSEMBLE PREDICTION</span>

                  <strong>
                    {result
                      ? `${isPositive ? "CKD" : "NOT CKD"} classification`
                      : "Awaiting laboratory data"}
                  </strong>

                  <small>
                    Individual trees contribute to the collective model
                    decision.
                  </small>
                </div>
              </div>

              <div className="ai-forest-connector">→</div>

              <div className="ai-forest-output">
                <span>MODEL OUTPUT</span>

                {result ? (
                  <>
                    <div className="ai-forest-result">
                      <strong>
                        {isPositive ? "CKD" : "NOT CKD"}
                      </strong>

                      <span>Model-indicated screening</span>
                    </div>

                    <div className="ai-forest-bars">
                      <div>
                        <div className="ai-bar-label">
                          <span>CKD</span>
                          <strong>{ckdProbability}%</strong>
                        </div>

                        <div className="ai-bar">
                          <i
                            style={{
                              width: `${ckdProbability}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="ai-bar-label">
                          <span>NOT CKD</span>
                          <strong>{notCkdProbability}%</strong>
                        </div>

                        <div className="ai-bar">
                          <i
                            style={{
                              width: `${notCkdProbability}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="ai-forest-empty">
                    <strong>Awaiting result</strong>

                    <span>
                      Submit laboratory data to display the actual model
                      probabilities.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="ai-forest-disclaimer">
              <span>i</span>

              <p>
                <strong>Model explanation:</strong> the visualization
                represents the 400-tree Random Forest ensemble. The
                individual tree icons are a visual representation of the
                ensemble, while the probability bars show the actual output
                returned by the trained model.
              </p>
            </div>
          </div>

          {/* =====================================================
              REFERENCE INTERVALS
              ===================================================== */}

          <div className="ai-reference-section">
            <div className="ai-reference-heading">
              <div>
                <span className="ai-section-label">
                  REFERENCE INFORMATION
                </span>

                <h3>Reference intervals & expected values</h3>
              </div>

              <p>
                The 24 model features come from laboratory measurements,
                urinalysis findings, and clinical information. Reference
                values provide context for the measurements but do not
                determine the model prediction by themselves.
              </p>
            </div>

            <div className="ai-reference-groups">
              {referenceGroups.map((group) => (
                <section
                  className="ai-reference-group"
                  key={group.title}
                >
                  <div className="ai-reference-group-heading">
                    <h4>{group.title}</h4>
                    <p>{group.description}</p>
                  </div>

                  <div className="ai-reference-table">
                    <div className="ai-reference-row ai-reference-header">
                      <span>Feature</span>
                      <span>Description</span>
                      <span>Type</span>
                      <span>Reference / expected</span>
                      <span>Unit</span>
                    </div>

                    {group.items.map((item) => (
                      <div
                        className="ai-reference-row"
                        key={item.key}
                      >
                        <strong>{item.label}</strong>

                        <span>{item.description}</span>

                        <span className="ai-reference-type">
                          {item.type}
                        </span>

                        <span className="ai-reference-value">
                          {item.reference}
                        </span>

                        <span>{item.unit || "—"}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="ai-reference-note">
              <span>i</span>

              <p>
                <strong>Important:</strong> reference intervals can vary by
                laboratory, measurement method, age, sex, clinical context,
                and other factors. Always use the reference range printed
                on the patient's laboratory report when interpreting an
                actual result.
              </p>
            </div>
          </div>

          {/* DISCLAIMER */}

          <div className="ai-explainer-note">
            <span>i</span>

            <p>
              <strong>Important:</strong> the model produces a screening
              indication. It does not independently diagnose chronic kidney
              disease or replace professional clinical evaluation.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          INPUT FORM
          ===================================================== */}

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

      {/* =====================================================
          RESULT
          ===================================================== */}

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

      {/* =====================================================
          TECHNICAL OVERVIEW
          ===================================================== */}

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