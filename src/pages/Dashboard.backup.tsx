import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    loadUser()
  }, [navigate])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          Loading your patient portal...
        </div>
      </main>
    )
  }

  const fullName =
    user?.user_metadata?.full_name || 'Patient'

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/" className="auth-brand">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span>
            <strong>AL-AZHAR</strong>
            <small>MEDICAL LAB</small>
          </span>
        </Link>

        <button
          type="button"
          className="dashboard-signout"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <span className="section-label">PATIENT PORTAL</span>

          <h1>
            Welcome, {fullName}.
          </h1>

          <p>
            Manage your laboratory appointments and patient information.
          </p>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <span className="dashboard-card-label">
              APPOINTMENTS
            </span>

            <h2>No appointments yet</h2>

            <p>
              Your upcoming laboratory appointments will appear here.
            </p>

            <button
              type="button"
              className="dashboard-action"
              disabled
            >
              Book an Appointment
            </button>
          </article>

          <article className="dashboard-card">
            <span className="dashboard-card-label">
              ACCOUNT
            </span>

            <h2>Your information</h2>

            <div className="dashboard-user-info">
              <div>
                <small>NAME</small>
                <strong>{fullName}</strong>
              </div>

              <div>
                <small>EMAIL</small>
                <strong>{user?.email}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

export default Dashboard
