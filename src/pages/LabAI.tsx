import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import './LabAI.css'

const API_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:8001'

const initialForm = {
  age: '',
  bp: '',
  sg: '',
  al: '',
  su: '',
  bgr: '',
  bu: '',
  sc: '',
  hemo: '',
  pcv: '',
  rbc: '',
  pc: '',
  htn: '',
  dm: '',
  appet: '',
}

function toNumber(value: string) {
  return value === '' ? null : Number(value)
}

export default function LabAI() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
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
      bgr: toNumber(form.bgr),
      bu: toNumber(form.bu),
      sc: toNumber(form.sc),
      hemo: toNumber(form.hemo),
      pcv: toNumber(form.pcv),
      rbc: form.rbc || null,
      pc: form.pc || null,
      htn: form.htn || null,
      dm: form.dm || null,
      appet: form.appet || null,
    }

    try {
      const response = await fetch(`${API_URL}/screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('The AI service could not process this screening.')
      }

      setResult(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="ai-page">
      <header className="ai-header">
        <div className="container ai-header-inner">
          <Link to="/" className="ai-brand">AL-AZHAR <span>MEDICAL LAB</span></Link>
          <Link to="/" className="ai-back">← Back to laboratory</Link>
        </div>
      </header>

      <section className="ai-hero">
        <div className="container ai-hero-inner">
          <span className="section-label">LABORATORY AI</span>
          <h1>Laboratory data.<br /><span>Machine-learning support.</span></h1>
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
              {[
                ['age', 'Age', 'years'],
                ['bp', 'Blood pressure', 'mmHg'],
                ['sg', 'Specific gravity', '1.005–1.025'],
                ['al', 'Urine albumin', '0–5'],
                ['su', 'Urine sugar', '0–5'],
                ['bgr', 'Blood glucose', 'mg/dL'],
                ['bu', 'Blood urea', 'mg/dL'],
                ['sc', 'Serum creatinine', 'mg/dL'],
                ['hemo', 'Hemoglobin', 'g/dL'],
                ['pcv', 'Packed cell volume', '%'],
              ].map(([name, label, unit]) => (
                <label key={name}>
                  <span>{label}<small>{unit}</small></span>
                  <input
                    type="number"
                    step="any"
                    value={form[name as keyof typeof form]}
                    onChange={(e) => update(name, e.target.value)}
                    placeholder="Optional"
                  />
                </label>
              ))}
            </div>

            <div className="ai-fields">
              {[
                ['rbc', 'Red blood cells', ['normal', 'abnormal']],
                ['pc', 'Pus cells', ['normal', 'abnormal']],
                ['htn', 'Hypertension', ['yes', 'no']],
                ['dm', 'Diabetes mellitus', ['yes', 'no']],
                ['appet', 'Appetite', ['good', 'poor']],
              ].map(([name, label, options]) => (
                <label key={name as string}>
                  <span>{label as string}</span>
                  <select
                    value={form[name as keyof typeof form]}
                    onChange={(e) => update(name as string, e.target.value)}
                  >
                    <option value="">Not provided</option>
                    {(options as string[]).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <button className="ai-submit" disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze laboratory data →'}
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
                <p>Submit the available laboratory values to run the trained model.</p>
              </div>
            )}

            {error && (
              <div className="ai-error">
                <span className="section-label">SERVICE ERROR</span>
                <h2>Unable to analyze.</h2>
                <p>{error}</p>
                <small>Make sure the FastAPI service is running on port 8001.</small>
              </div>
            )}

            {result && (
              <div className="ai-result">
                <span className="section-label">MODEL OUTPUT</span>
                <h2>
                  {result.prediction === 'ckd'
                    ? 'Model-indicated CKD screening result'
                    : 'Model-indicated non-CKD screening result'}
                </h2>

                <div className="ai-probabilities">
                  {Object.entries(result.probabilities).map(([label, value]) => (
                    <div key={label} className="ai-probability">
                      <div>
                        <span>{label.toUpperCase()}</span>
                        <strong>{Math.round(Number(value) * 100)}%</strong>
                      </div>
                      <div className="ai-bar">
                        <i style={{ width: `${Number(value) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="ai-result-message">{result.message}</p>
                <button className="ai-reset" onClick={() => setResult(null)}>Run another screening</button>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
