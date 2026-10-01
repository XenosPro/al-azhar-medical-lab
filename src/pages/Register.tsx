import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Register.css'

function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(event: FormEvent) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(
      'Account created successfully. Please check your email to confirm your account.',
    )

    setLoading(false)
  }

  return (
    <main className="register-page">
      <div className="register-background">
        <div className="register-glow register-glow-one" />
        <div className="register-glow register-glow-two" />
        <div className="register-grid" />
      </div>

      <div className="register-shell">
        <div className="register-side">
          <Link to="/" className="register-brand">
            <span className="register-brand-mark">+</span>

            <span className="register-brand-name">
              <strong>AL-AZHAR</strong>
              <small>MEDICAL LAB</small>
            </span>
          </Link>

          <div className="register-side-content">
            <span className="register-kicker">PATIENT PORTAL</span>

            <h1>
              Better access
              <br />
              <span>to your care.</span>
            </h1>

            <p>
              Create your secure patient account and make managing your
              laboratory visits simpler.
            </p>

            <div className="register-feature-list">
              <div>
                <span>01</span>
                <p>Create your personal patient account</p>
              </div>

              <div>
                <span>02</span>
                <p>Request appointments online</p>
              </div>

              <div>
                <span>03</span>
                <p>Keep your laboratory visits organized</p>
              </div>
            </div>
          </div>

          <div className="register-side-footer">
            <span>Cherchell, Algeria</span>
            <span>•</span>
            <span>Al-Azhar Medical Lab</span>
          </div>
        </div>

        <div className="register-panel">
          <div className="register-card">
            <div className="register-mobile-brand">
              <Link to="/" className="register-brand">
                <span className="register-brand-mark">+</span>

                <span className="register-brand-name">
                  <strong>AL-AZHAR</strong>
                  <small>MEDICAL LAB</small>
                </span>
              </Link>
            </div>

            <div className="register-heading">
              <span className="register-section-label">
                CREATE ACCOUNT
              </span>

              <h2>Welcome.</h2>

              <p>
                Create your patient account to manage your appointments.
              </p>
            </div>

            <form onSubmit={handleRegister} className="register-form">
              <div className="register-field">
                <label htmlFor="full-name">Full name</label>

                <div className="register-input-wrap">
                  <span className="register-input-icon">◎</span>

                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="register-email">Email address</label>

                <div className="register-input-wrap">
                  <span className="register-input-icon">@</span>

                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <div className="register-label-row">
                  <label htmlFor="register-password">Password</label>

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="register-input-wrap">
                  <span className="register-input-icon">•••</span>

                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <div className="register-label-row">
                  <label htmlFor="confirm-password">
                    Confirm password
                  </label>

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="register-input-wrap">
                  <span className="register-input-icon">•••</span>

                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="register-message register-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="register-message register-success">
                  <span>✓</span>
                  <p>{success}</p>
                </div>
              )}

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="register-spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="register-divider">
              <span>ALREADY REGISTERED?</span>
            </div>

            <Link to="/login" className="register-login">
              Sign in to your account
              <span>→</span>
            </Link>

            <Link to="/" className="register-back">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Register
