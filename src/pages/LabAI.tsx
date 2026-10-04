import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
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

const numericFields: readonly [
  FormField,
  string,
  string,
][] = [
  ['age', 'Age', 'years'],
  ['bp', 'Blood pressure', 'mmHg'],
  ['sg', 'Specific gravity', '1.005–1.025'],
  ['al', 'Urine albumin', '0–5'],
  ['su', 'Urine sugar', '0–5'],
  ['bgr', 'Blood glucose', 'mg/dL'],
  ['bu', 'Blood urea', 'mg/dL'],
  ['sc', 'Serum creatinine', 'mg/dL'],
  ['sod', 'Sodium', 'mEq/L'],
  ['pot', 'Potassium', 'mEq/L'],
  ['hemo', 'Hemoglobin', 'g/dL'],
  ['pcv', 'Packed cell volume', '%'],
  ['wbcc', 'White blood cell count', 'cells/cumm'],
  ['rbcc', 'Red blood cell count', 'millions/cumm'],
]

const categoricalFields: readonly [
  FormField,
  string,
  readonly string[],
][] = [
  ['rbc', 'Red blood cells', ['normal', 'abnormal']],
  ['pc', 'Pus cells', ['normal', 'abnormal']],
  ['pcc', 'Pus cell clumps', ['present', 'notpresent']],
  ['ba', 'Bacteria', ['present', 'notpresent']],
  ['htn', 'Hypertension', ['yes', 'no']],
  ['dm', 'Diabetes mellitus', ['yes', 'no']],
  ['cad', 'Coronary artery disease', ['yes', 'no']],
  ['appet', 'Appetite', ['good', 'poor']],
  ['pe', 'Pedal edema', ['yes', 'no']],
  ['ane', 'Anemia', ['yes', 'no']],
]

function toNumber(value: string) {
  if (value.trim() === '') {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

export default function LabAI() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(name: FormField, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
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

    console.log('AI REQUEST:', payload)

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
        console.error('AI SERVICE ERROR:', responseData)

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

  return (
    <main className="ai-page">
      <header className="ai-header">
        <div className="container ai-header-inner">
          <Link to="/" className="ai-brand">
            AL-AZHAR <span>MEDICAL LAB</span>
          </Link>

          <Link to="/" className="ai-back">
            ← Back to laboratory
          </Link>
        </div>
      </header>

      <section className="ai-hero">
        <div className="container ai-hero-inner">
          <span className="section-label">LABORATORY AI</span>

          <h1>
            Laboratory data.
            <br />
            <span>Machine-learning support.</span>
          </h1>

          <p>
            Enter available laboratory values to receive a model-generated CKD
            screening result. Missing fields can be left blank.
          </p>
        </div>
      </section>

      <section className="ai-content">
        <div className="container ai-grid">
          <form className="ai-form" onSubmit={submit}>
            <div className="ai-form-heading">
              <div>
                <span className="section-label">SCREENING INPUT</span>
                <h2>Laboratory values</h2>
              </div>

              <span className="ai-badge">ML MODEL</span>
            </div>

            <div className="ai-fields">
              {numericFields.map(([name, label, unit]) => (
                <label key={name}>
                  <span>
                    {label}
                    <small>{unit}</small>
                  </span>

                  <input
                    type="number"
                    step="any"
                    value={form[name]}
                    onChange={(event) =>
                      update(name, event.target.value)
                    }
                    placeholder="Optional"
                  />
                </label>
              ))}
            </div>

            <div className="ai-fields">
              {categoricalFields.map(([name, label, options]) => (
                <label key={name}>
                  <span>{label}</span>

                  <select
                    value={form[name]}
                    onChange={(event) =>
                      update(name, event.target.value)
                    }
                  >
                    <option value="">Not provided</option>

                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <button className="ai-submit" disabled={loading}>
              {loading
                ? 'Analyzing…'
                : 'Analyze laboratory data →'}
            </button>

            <p className="ai-disclaimer">
              This tool is a research/educational screening aid. It is not a
              diagnosis and should not replace professional medical evaluation.
            </p>
          </form>

          <aside className="ai-result-panel">
            {!result && !error && (
              <div className="ai-empty">
                <span className="ai-result-mark">+</span>

                <span className="section-label">MODEL OUTPUT</span>

                <h2>Your result will appear here.</h2>

                <p>
                  Submit the available laboratory values to run the trained
                  model.
                </p>
              </div>
            )}

            {error && (
              <div className="ai-error">
                <span className="section-label">SERVICE ERROR</span>

                <h2>Unable to analyze.</h2>

                <p style={{ whiteSpace: 'pre-line' }}>
                  {error}
                </p>

                <small>
                  Check the FastAPI terminal for the request details.
                </small>
              </div>
            )}

            {result && (
              <div className="ai-result">
                <span className="section-label">MODEL OUTPUT</span>

                <h2>
                  {result.prediction === 'ckd'
                    ? 'Model-indicated CKD screening: Positive'
                    : 'Model-indicated CKD screening: Negative'}
                </h2>

                <div className="ai-probabilities">
                  {Object.entries(result.probabilities).map(
                    ([label, value]) => {
                      const probability = Number(value)

                      return (
                        <div
                          key={label}
                          className="ai-probability"
                        >
                          <div>
                            <span>
                              {label === 'ckd'
                                ? 'CKD'
                                : 'NOT CKD'}
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

                <p className="ai-result-message">
                  {result.prediction === 'ckd'
                    ? 'The model detected a pattern associated with CKD in the submitted laboratory data.'
                    : 'The model did not detect a strong pattern associated with CKD in the submitted laboratory data.'}
                </p>

                <p className="ai-disclaimer">
                  This result is for screening support only and is not a
                  medical diagnosis. It should be reviewed by a qualified
                  healthcare professional.
                </p>

                <button
                  type="button"
                  className="ai-reset"
                  onClick={() => {
                    setResult(null)
                    setError('')
                  }}
                >
                  Run another screening
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}