import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event: FormEvent) {
    event.preventDefault()

    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/dashboard')
  }

  return (
    <main className="login-page">
      <div className="login-background">
        <div className="login-glow login-glow-one" />
        <div className="login-glow login-glow-two" />
        <div className="login-grid" />
      </div>

      <div className="login-shell">
        <div className="login-side">
          <Link to="/" className="login-brand">
            <span className="login-brand-mark">+</span>

            <span className="login-brand-name">
              <strong>AL-AZHAR</strong>
              <small>MEDICAL LAB</small>
            </span>
          </Link>

          <div className="login-side-content">
            <span className="login-kicker">PATIENT PORTAL</span>

            <h1>
              Your healthcare,
              <br />
              <span>in one place.</span>
            </h1>

            <p>
              Manage your appointments and stay connected with
              Al-Azhar Medical Lab through your secure patient account.
            </p>

            <div className="login-feature-list">
              <div>
                <span>01</span>
                <p>Manage your appointments</p>
              </div>

              <div>
                <span>02</span>
                <p>Request laboratory visits online</p>
              </div>

              <div>
                <span>03</span>
                <p>Access your patient account</p>
              </div>
            </div>
          </div>

          <div className="login-side-footer">
            <span>Cherchell, Algeria</span>
            <span>•</span>
            <span>Al-Azhar Medical Lab</span>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-card">
            <div className="mobile-brand">
              <Link to="/" className="login-brand">
                <span className="login-brand-mark">+</span>

                <span className="login-brand-name">
                  <strong>AL-AZHAR</strong>
                  <small>MEDICAL LAB</small>
                </span>
              </Link>
            </div>

            <div className="login-heading">
              <span className="login-section-label">PATIENT SIGN IN</span>

              <h2>Welcome back.</h2>

              <p>
                Sign in to manage your appointments and patient account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="login-field">
                <label htmlFor="email">Email address</label>

                <div className="login-input-wrap">
                  <span className="login-input-icon">@</span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="login-label-row">
                  <label htmlFor="password">Password</label>

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="login-input-wrap">
                  <span className="login-input-icon">•••</span>

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="login-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>NEW PATIENT?</span>
            </div>

            <Link to="/register" className="login-register">
              Create a patient account
              <span>→</span>
            </Link>

            <Link to="/" className="login-back">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login
