import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './LabAI.css'

const API_URL =
  import.meta.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:8001'

const initialForm = {
  age: '',
  bp: '',
  sg: '',
  al: '',
  su: '',
  rbc: '',
  pc: '',
  pcc: '',
  ba: '',
  bgr: '',
  bu: '',
  sc: '',
  sod: '',
  pot: '',
  hemo: '',
  pcv: '',
  wbcc: '',
  rbcc: '',
  htn: '',
  dm: '',
  cad: '',
  appet: '',
  pe: '',
  ane: '',
}

type FormField = keyof typeof initialForm

type NumericField = readonly [
  FormField,
  string,
  string,
  string?,
]

type CategoricalField = readonly [
  FormField,
  string,
  readonly string[],
  string?,
]

const patientFields: readonly NumericField[] = [
  ['age', 'Age', 'years', 'e.g. 45'],
  ['bp', 'Blood pressure', 'mmHg', 'e.g. 80'],
]

const urinalysisFields: readonly NumericField[] = [
  ['sg', 'Specific gravity', '1.005–1.025', 'e.g. 1.020'],
  ['al', 'Urine albumin', '0–5', 'e.g. 0'],
  ['su', 'Urine sugar', '0–5', 'e.g. 0'],
]

const urinalysisCategorical: readonly CategoricalField[] = [
  ['rbc', 'Red blood cells', ['normal', 'abnormal']],
  ['pc', 'Pus cells', ['normal', 'abnormal']],
  ['pcc', 'Pus cell clumps', ['present', 'notpresent']],
  ['ba', 'Bacteria', ['present', 'notpresent']],
]

const bloodFields: readonly NumericField[] = [
  ['bgr', 'Blood glucose', 'mg/dL', 'e.g. 120'],
  ['bu', 'Blood urea', 'mg/dL', 'e.g. 40'],
  ['sc', 'Serum creatinine', 'mg/dL', 'e.g. 1.2'],
  ['sod', 'Sodium', 'mEq/L', 'e.g. 140'],
  ['pot', 'Potassium', 'mEq/L', 'e.g. 4.5'],
]

const hematologyFields: readonly NumericField[] = [
  ['hemo', 'Hemoglobin', 'g/dL', 'e.g. 13.5'],
  ['pcv', 'Packed cell volume', '%', 'e.g. 40'],
  ['wbcc', 'White blood cell count', 'cells/cumm', 'e.g. 8000'],
  ['rbcc', 'Red blood cell count', 'millions/cumm', 'e.g. 5.0'],
]

const clinicalFields: readonly CategoricalField[] = [
  ['htn', 'Hypertension', ['yes', 'no']],
  ['dm', 'Diabetes mellitus', ['yes', 'no']],
  ['cad', 'Coronary artery disease', ['yes', 'no']],
  ['appet', 'Appetite', ['good', 'poor']],
  ['pe', 'Pedal edema', ['yes', 'no']],
  ['ane', 'Anemia', ['yes', 'no']],
]

function toNumber(value: string) {
  if (value.trim() === '') return null

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

export default function LabAI() {
  const navigate = useNavigate()

  const [authChecking, setAuthChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        navigate('/login', { replace: true })
        return
      }

      setIsAuthenticated(true)
      setAuthChecking(false)
    }

    checkAuth()
  }, [navigate])

  function update(name: FormField, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setError('')
  }

  const completedFields = useMemo(() => {
    return Object.values(form).filter((value) => value.trim() !== '').length
  }, [form])

  const completionPercentage = Math.round(
    (completedFields / Object.keys(initialForm).length) * 100,
  )

  function resetForm() {
    setForm(initialForm)
    setResult(null)
    setError('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()

    setLoading(true)
    setError('')
    setResult(null)

    const payload = {
      age: toNumber(form.age),
      bp: toNumber(form.bp),
      sg: toNumber(form.sg),
      al: toNumber(form.al),
      su: toNumber(form.su),

      rbc: form.rbc || null,
      pc: form.pc || null,
      pcc: form.pcc || null,
      ba: form.ba || null,

      bgr: toNumber(form.bgr),
      bu: toNumber(form.bu),
      sc: toNumber(form.sc),
      sod: toNumber(form.sod),
      pot: toNumber(form.pot),
      hemo: toNumber(form.hemo),
      pcv: toNumber(form.pcv),
      wbcc: toNumber(form.wbcc),
      rbcc: toNumber(form.rbcc),

      htn: form.htn || null,
      dm: form.dm || null,
      cad: form.cad || null,
      appet: form.appet || null,
      pe: form.pe || null,
      ane: form.ane || null,
    }

    try {
      const response = await fetch(`${API_URL}/screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json().catch(() => null)

      if (!response.ok) {
        const detail = responseData?.detail

        if (Array.isArray(detail)) {
          const validationErrors = detail
            .map((item: any) => {
              const field = Array.isArray(item.loc)
                ? item.loc.join('.')
                : 'field'

              return `${field}: ${item.msg}`
            })
            .join('\n')

          throw new Error(validationErrors)
        }

        throw new Error(
          typeof detail === 'string'
            ? detail
            : `AI service returned HTTP ${response.status}.`,
        )
      }

      setResult(responseData)
    } catch (err) {
      console.error('AI REQUEST FAILED:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while contacting the AI service.',
      )
    } finally {
      setLoading(false)
    }
  }

  function renderNumericFields(fields: readonly NumericField[]) {
    return fields.map(([name, label, unit, placeholder]) => (
      <label className="ai-field" key={name}>
        <span className="ai-field-label">
          {label}
          <small>{unit}</small>
        </span>

        <input
          type="number"
          step="any"
          value={form[name]}
          onChange={(event) => update(name, event.target.value)}
          placeholder={placeholder || 'Optional'}
        />
      </label>
    ))
  }

  function renderCategoricalFields(
    fields: readonly CategoricalField[],
  ) {
    return fields.map(([name, label, options]) => (
      <label className="ai-field" key={name}>
        <span className="ai-field-label">{label}</span>

        <select
          value={form[name]}
          onChange={(event) => update(name, event.target.value)}
        >
          <option value="">Not provided</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    ))
  }

  if (authChecking) {
    return (
      <main className="ai-page">
        <div className="ai-loading-screen">
          <div className="ai-loading-spinner" />
          <p>Checking your access…</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) return null

  return (
    <main className="ai-page">
      <header className="ai-header">
        <div className="ai-container ai-header-inner">
          <Link to="/" className="ai-brand">
            <span className="ai-brand-mark">A</span>
            <span>
              AL-AZHAR
              <small>MEDICAL LAB</small>
            </span>
          </Link>

          <Link to="/" className="ai-back">
            ← Back to laboratory
          </Link>
        </div>
      </header>

      <section className="ai-hero">
        <div className="ai-container ai-hero-inner">
          <div className="ai-hero-copy">
            <div className="ai-status-pill">
              <span />
              AI-POWERED SCREENING SUPPORT
            </div>

            <span className="ai-section-label">LABORATORY AI</span>

            <h1>
              Laboratory data.
              <br />
              <strong>Machine-learning support.</strong>
            </h1>

            <p>
              Analyze available laboratory parameters using our trained
              machine-learning model to generate a CKD screening indication.
            </p>

            <div className="ai-hero-note">
              <span>i</span>
              <p>
                This system provides screening support only. It does not
                provide a medical diagnosis.
              </p>
            </div>
          </div>

          <div className="ai-hero-card">
            <div className="ai-hero-card-icon">✦</div>
            <strong>Clinical data → ML analysis</strong>
            <span>24 laboratory parameters</span>
            <span>Random Forest classification</span>
          </div>
        </div>
      </section>

      <section className="ai-content">
        <div className="ai-container">
          <div className="ai-page-intro">
            <div>
              <span className="ai-section-label">SCREENING INPUT</span>
              <h2>Laboratory data</h2>
              <p>
                Enter the available patient parameters. Fields can be left
                blank when information is unavailable.
              </p>
            </div>

            <div className="ai-completion">
              <div>
                <strong>{completedFields}</strong>
                <span>/ 24 parameters</span>
              </div>

              <div className="ai-progress-track">
                <i style={{ width: `${completionPercentage}%` }} />
              </div>

              <small>{completionPercentage}% completed</small>
            </div>
          </div>

          <div className="ai-grid">
            <form className="ai-form" onSubmit={submit}>
              <section className="ai-section-card">
                <div className="ai-card-heading">
                  <div className="ai-card-number">01</div>
                  <div>
                    <h3>Patient profile</h3>
                    <p>Basic patient measurements</p>
                  </div>
                </div>

                <div className="ai-fields">
                  {renderNumericFields(patientFields)}
                </div>
              </section>

              <section className="ai-section-card">
                <div className="ai-card-heading">
                  <div className="ai-card-number">02</div>
                  <div>
                    <h3>Urinalysis</h3>
                    <p>Urine examination parameters</p>
                  </div>
                </div>

                <div className="ai-fields">
                  {renderNumericFields(urinalysisFields)}
                  {renderCategoricalFields(urinalysisCategorical)}
                </div>
              </section>

              <section className="ai-section-card">
                <div className="ai-card-heading">
                  <div className="ai-card-number">03</div>
                  <div>
                    <h3>Blood chemistry</h3>
                    <p>Biochemical laboratory measurements</p>
                  </div>
                </div>

                <div className="ai-fields">
                  {renderNumericFields(bloodFields)}
                </div>
              </section>

              <section className="ai-section-card">
                <div className="ai-card-heading">
                  <div className="ai-card-number">04</div>
                  <div>
                    <h3>Hematology</h3>
                    <p>Blood cell and hemoglobin measurements</p>
                  </div>
                </div>

                <div className="ai-fields">
                  {renderNumericFields(hematologyFields)}
                </div>
              </section>

              <section className="ai-section-card">
                <div className="ai-card-heading">
                  <div className="ai-card-number">05</div>
                  <div>
                    <h3>Clinical history</h3>
                    <p>Relevant clinical indicators</p>
                  </div>
                </div>

                <div className="ai-fields">
                  {renderCategoricalFields(clinicalFields)}
                </div>
              </section>

              <div className="ai-form-actions">
                <button
                  type="button"
                  className="ai-reset-form"
                  onClick={resetForm}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="ai-submit"
                  disabled={loading}
                >
                  <span>
                    {loading ? 'Analyzing laboratory data…' : 'Analyze data'}
                  </span>
                  {!loading && <span>→</span>}
                </button>
              </div>

              <div className="ai-disclaimer">
                <span>!</span>
                <p>
                  This tool is a research and educational screening aid. It
                  is not a diagnosis and should not replace professional
                  medical evaluation.
                </p>
              </div>
            </form>

            <aside className="ai-result-panel">
              {!result && !error && (
                <div className="ai-empty">
                  <div className="ai-output-icon">
                    <span>✦</span>
                  </div>

                  <span className="ai-section-label">MODEL OUTPUT</span>

                  <h2>Your screening result will appear here.</h2>

                  <p>
                    Complete the available laboratory information and run the
                    analysis to see the model-indicated screening result.
                  </p>

                  <div className="ai-method-card">
                    <div>
                      <span>MODEL</span>
                      <strong>Random Forest</strong>
                    </div>

                    <div>
                      <span>TASK</span>
                      <strong>CKD classification</strong>
                    </div>

                    <div>
                      <span>INPUT</span>
                      <strong>Laboratory data</strong>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="ai-error">
                  <div className="ai-output-icon error">
                    !
                  </div>

                  <span className="ai-section-label">SERVICE ERROR</span>

                  <h2>Unable to analyze.</h2>

                  <p className="ai-error-message">{error}</p>

                  <button
                    type="button"
                    className="ai-reset"
                    onClick={() => setError('')}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {result && (
                <div className="ai-result">
                  <div
                    className={`ai-result-icon ${
                      result.prediction === 'ckd'
                        ? 'positive'
                        : 'negative'
                    }`}
                  >
                    {result.prediction === 'ckd' ? '!' : '✓'}
                  </div>

                  <span className="ai-section-label">
                    MODEL-INDICATED SCREENING
                  </span>

                  <h2>
                    {result.prediction === 'ckd'
                      ? 'Positive'
                      : 'Negative'}
                  </h2>

                  <p className="ai-result-subtitle">
                    {result.prediction === 'ckd'
                      ? 'The submitted laboratory pattern was classified as CKD by the model.'
                      : 'The submitted laboratory pattern was classified as NOT CKD by the model.'}
                  </p>

                  <div className="ai-probabilities">
                    {Object.entries(result.probabilities).map(
                      ([label, value]) => {
                        const probability = Number(value)

                        return (
                          <div className="ai-probability" key={label}>
                            <div className="ai-probability-heading">
                              <span>
                                {label === 'ckd' ? 'CKD' : 'NOT CKD'}
                              </span>

                              <strong>
                                {Math.round(probability * 100)}%
                              </strong>
                            </div>

                            <div className="ai-bar">
                              <i
                                style={{
                                  width: `${probability * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      },
                    )}
                  </div>

                  <div className="ai-result-explanation">
                    <span>How to interpret this</span>
                    <p>
                      The percentage represents the model's estimated
                      probability for each class based on the submitted
                      laboratory parameters.
                    </p>
                  </div>

                  <div className="ai-result-warning">
                    <strong>Important</strong>
                    <p>
                      This is an AI-assisted screening result, not a medical
                      diagnosis. A qualified healthcare professional should
                      interpret it alongside the patient's complete clinical
                      context.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="ai-reset"
                    onClick={resetForm}
                  >
                    Run another screening
                  </button>
                </div>
              )}
            </aside>
          </div>

          <section className="ai-how-section">
            <div>
              <span className="ai-section-label">THE PROCESS</span>
              <h2>How Laboratory AI works</h2>
              <p>
                A simple machine-learning workflow designed to support
                laboratory screening.
              </p>
            </div>

            <div className="ai-steps">
              <article>
                <span>01</span>
                <h3>Laboratory data</h3>
                <p>
                  Available laboratory parameters are entered into the
                  screening interface.
                </p>
              </article>

              <article>
                <span>02</span>
                <h3>ML analysis</h3>
                <p>
                  The submitted data is processed by the trained Random Forest
                  classification model.
                </p>
              </article>

              <article>
                <span>03</span>
                <h3>Screening output</h3>
                <p>
                  The model returns its predicted class and probability
                  distribution.
                </p>
              </article>

              <article>
                <span>04</span>
                <h3>Clinical interpretation</h3>
                <p>
                  A healthcare professional evaluates the result in its
                  appropriate clinical context.
                </p>
              </article>
            </div>
          </section>

          <section className="ai-technical">
            <div>
              <span className="ai-section-label">TECHNICAL OVERVIEW</span>
              <h2>Built for laboratory screening support.</h2>
            </div>

            <div className="ai-technical-grid">
              <div>
                <span>MODEL</span>
                <strong>Random Forest Classifier</strong>
              </div>

              <div>
                <span>TASK</span>
                <strong>Binary CKD classification</strong>
              </div>

              <div>
                <span>DATA</span>
                <strong>UCI Chronic Kidney Disease</strong>
              </div>

              <div>
                <span>OUTPUT</span>
                <strong>Class + probabilities</strong>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}