import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  classifyBloodCell,
  type BloodCellResult,
} from "../lib/bloodCellClassifier";
import "./LabVision.css";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export default function LabVision() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<"checking" | "ready" | "error">("checking");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<BloodCellResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    supabase.auth.getSession()
      .then(({ data, error: authError }) => {
        if (!active) return;
        if (authError) throw authError;
        if (!data.session) {
          navigate("/login", { replace: true });
          return;
        }
        setAuthState("ready");
      })
      .catch(() => {
        if (active) setAuthState("error");
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = ""; // Allows selecting the same file again.
    if (!selected) return;
    setResult(null);
    setError("");
    setFile(null);
    if (!ALLOWED_TYPES.has(selected.type)) {
      setError("Choose a PNG, JPG, JPEG, or WebP image.");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setError("Image must be 10 MB or smaller.");
      return;
    }
    setFile(selected);
  }

  async function analyze() {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const prediction = await classifyBloodCell(file);
      if (mounted.current) setResult(prediction);
    } catch (cause) {
      if (mounted.current) {
        setError(cause instanceof Error ? cause.message : "Unable to classify this image.");
      }
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  function clearImage() {
    if (busy) return;
    setFile(null);
    setResult(null);
    setError("");
  }

  if (authState === "checking") {
    return (
      <main className="lab-vision-page lab-vision-auth-state">
        <p role="status">Checking secure session…</p>
      </main>
    );
  }
  if (authState === "error") {
    return (
      <main className="lab-vision-page lab-vision-auth-state">
        <p role="alert">Unable to verify your session. Please refresh and try again.</p>
        <Link to="/login">Go to sign in</Link>
      </main>
    );
  }

  return (
    <main className="lab-vision-page">
      <section className="lab-vision-hero">
        <div className="lab-vision-container">
          <nav className="lab-vision-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link><span aria-hidden="true">/</span>
            <Link to="/lab-ai">Lab AI</Link><span aria-hidden="true">/</span>
            <span>LabVision</span>
          </nav>
          <div className="lab-vision-hero-grid">
            <div>
              <span className="lab-vision-kicker"><i /> AI / 02 · IMAGE INTELLIGENCE</span>
              <h1>Explore blood cells.<br /><em>Powered by AI.</em></h1>
              <p>
                Upload a single-cell microscopy image to explore how a trained
                MobileNetV2 model distinguishes Parasitized and Uninfected samples.
              </p>
              <div className="lab-vision-features">
                <span>✓ Browser-based inference</span>
                <span>✓ 160 × 160 RGB model</span>
                <span>✓ No image upload to a server</span>
              </div>
            </div>
            <div className="lab-vision-hero-panel" aria-label="Classification workflow">
              <div className="lab-vision-panel-top"><span className="lab-vision-panel-icon">◎</span><span>LAB / VISION 02</span></div>
              <h2>Image analysis workflow</h2>
              <p>Three steps. One experimental model-indicated result.</p>
              <ol>
                <li><b>01</b><span><strong>Select image</strong><small>Single-cell microscopy sample</small></span></li>
                <li><b>02</b><span><strong>Run classifier</strong><small>MobileNetV2 in your browser</small></span></li>
                <li><b>03</b><span><strong>Review result</strong><small>Predicted class and raw scores</small></span></li>
              </ol>
              <div className="lab-vision-panel-note">Research demonstration · Not a diagnostic service</div>
            </div>
          </div>
          <div className="lab-vision-hero-footer"><span>AL-AZHAR MEDICAL LABORATORY</span><span>LABVISION / EXPERIMENTAL AI</span></div>
        </div>
      </section>

      <section className="lab-vision-workspace">
        <div className="lab-vision-container">
          <header className="lab-vision-section-head">
            <span className="lab-vision-eyebrow">IMAGE CLASSIFICATION</span>
            <h2>Analyze a microscopy image</h2>
            <p>Use a labeled or research microscopy image. This tool is not for patient care or clinical decisions.</p>
          </header>
          <div className="lab-vision-workspace-grid">
            <section className="lab-vision-card" aria-labelledby="lab-vision-upload-title">
              <div className="lab-vision-card-head">
                <span className="lab-vision-number">01</span>
                <div><h3 id="lab-vision-upload-title">Image input</h3><p>Select one blood-cell image</p></div>
              </div>
              {previewUrl ? (
                <div className="lab-vision-preview">
                  <img src={previewUrl} alt="Selected blood-cell microscopy sample" />
                </div>
              ) : (
                <div className="lab-vision-empty-preview" aria-hidden="true">
                  <span className="lab-vision-drop-icon">◈</span>
                  <strong>Microscopy image preview</strong>
                  <small>Supported formats: JPG, PNG, WebP · Max 10 MB</small>
                </div>
              )}
              <label className={`lab-vision-file-button${busy ? " is-disabled" : ""}`}>
                <span>{file ? "Choose another image" : "Choose an image"}</span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={selectImage}
                  disabled={busy}
                  aria-label="Choose a blood-cell image"
                />
              </label>
              <p className="lab-vision-filename" aria-live="polite">
                {file ? file.name : "No file selected"}
              </p>
              <div className="lab-vision-actions">
                <button className="lab-vision-secondary-button" type="button" onClick={clearImage} disabled={!file || busy}>
                  Reset
                </button>
                <button className="lab-vision-primary-button" type="button" onClick={analyze} disabled={!file || busy}>
                  {busy ? "Analyzing…" : "Analyze image →"}
                </button>
              </div>
              {error && <p className="lab-vision-error" role="alert">{error}</p>}
            </section>

            <section className="lab-vision-card" aria-labelledby="lab-vision-result-title">
              <div className="lab-vision-card-head">
                <span className="lab-vision-number">02</span>
                <div><h3 id="lab-vision-result-title">Classification output</h3><p>Experimental model interpretation</p></div>
              </div>
              <div aria-live="polite" aria-atomic="true">
                {busy ? (
                  <div className="lab-vision-placeholder" role="status"><span className="lab-vision-spinner" />Running the model locally…</div>
                ) : result ? (
                  <div className="lab-vision-result">
                    <span className="lab-vision-result-kicker">MODEL-INDICATED CLASS</span>
                    <div className={`lab-vision-result-class ${result.label === "Parasitized" ? "is-parasitized" : "is-uninfected"}`}>
                      <span className="lab-vision-result-dot" aria-hidden="true" />
                      <strong>{result.label}</strong>
                    </div>
                    <p>Raw sigmoid-model scores, not calibrated diagnostic probabilities.</p>
                    <div className="lab-vision-score-row"><span>Parasitized score</span><strong>{result.parasitizedScore.toFixed(6)}</strong></div>
                    <div className="lab-vision-score-track"><span style={{ width: `${result.parasitizedScore * 100}%` }} /></div>
                    <div className="lab-vision-score-row"><span>Uninfected score</span><strong>{result.uninfectedScore.toFixed(6)}</strong></div>
                    <div className="lab-vision-score-track is-teal"><span style={{ width: `${result.uninfectedScore * 100}%` }} /></div>
                  </div>
                ) : (
                  <div className="lab-vision-placeholder">
                    <span className="lab-vision-placeholder-icon" aria-hidden="true">◎</span>
                    <strong>Awaiting analysis</strong>
                    <p>Select an image and choose “Analyze image” to view a model result.</p>
                  </div>
                )}
              </div>
              <div className="lab-vision-privacy-note">
                <strong>Local processing</strong>
                <span>Model weights download to your browser; the selected image is processed locally and is not sent to our AI backend.</span>
              </div>
            </section>
          </div>
          <div className="lab-vision-warning" role="note">
            <strong>Important medical limitation</strong>
            <p>
              Experimental educational classifier only. A model-indicated “Uninfected” result cannot rule out malaria.
              Do not use this feature to diagnose, exclude infection, or guide treatment. Consult qualified laboratory
              professionals and validated diagnostic testing.
            </p>
          </div>
        </div>
      </section>

      <section className="lab-vision-details">
        <div className="lab-vision-container">
          <header className="lab-vision-section-head">
            <span className="lab-vision-eyebrow">ABOUT THE MODEL</span>
            <h2>How LabVision works</h2>
          </header>
          <div className="lab-vision-details-grid">
            <article><span>01 / INPUT</span><h3>Microscopy image</h3><p>Single-cell RGB image, resized to 160 × 160 pixels.</p></article>
            <article><span>02 / NETWORK</span><h3>MobileNetV2</h3><p>Frozen pretrained feature extractor with a sigmoid classification head.</p></article>
            <article><span>03 / PROCESSING</span><h3>On-device inference</h3><p>TensorFlow.js GraphModel with the trained preprocessing graph included.</p></article>
            <article><span>04 / OUTPUT</span><h3>Two classes</h3><p>Parasitized or Uninfected model-indicated output, subject to error.</p></article>
          </div>
          <p className="lab-vision-validation-note">Development validation accuracy: 94.57% on 5,511 validation images. No independent clinical validation has been established.</p>
        </div>
      </section>
    </main>
  );
}
