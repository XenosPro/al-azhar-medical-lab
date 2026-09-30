import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

type Appointment = {
  id: string
  service: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
}

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)

      const { data, error } = await supabase
        .from('appointments')
        .select(
          'id, service, appointment_date, appointment_time, status, notes, created_at',
        )
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (!error && data) {
        setAppointments(data as Appointment[])
      }

      setAppointmentsLoading(false)
      setLoading(false)
    }

    loadDashboard()
  }, [navigate])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function formatDate(dateString: string) {
    const date = new Date(`${dateString}T00:00:00`)

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function formatTime(timeString: string) {
    const [hours, minutes] = timeString.split(':').map(Number)

    const date = new Date()
    date.setHours(hours, minutes, 0, 0)

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function getStatusLabel(status: Appointment['status']) {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  function getStatusClass(status: Appointment['status']) {
    return `appointment-status ${status}`
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />
          <span>Loading patient portal...</span>
        </div>
      </main>
    )
  }

  const fullName =
    user?.user_metadata?.full_name || 'Patient'

  const firstName = fullName.split(' ')[0]

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === 'pending' ||
      appointment.status === 'confirmed',
  )

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/" className="dashboard-brand">
          <span className="dashboard-brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span className="dashboard-brand-text">
            <strong>AL-AZHAR</strong>
            <small>MEDICAL LAB</small>
          </span>
        </Link>

        <nav className="dashboard-nav">
          <Link to="/" className="dashboard-home-link">
            Website
          </Link>

          <button
            type="button"
            className="dashboard-signout"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </nav>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">
              PATIENT PORTAL
            </span>

            <h1>
              Good to see you, {firstName}.
            </h1>

            <p>
              Manage your laboratory appointments and personal information
              from one place.
            </p>
          </div>

          <div className="dashboard-status">
            <span className="status-dot" />
            <span>Account active</span>
          </div>
        </div>

        <div className="dashboard-overview">
          <div className="overview-card overview-primary">
            <div className="overview-icon">
              +
            </div>

            <div>
              <span>APPOINTMENTS</span>

              <strong>
                {upcomingAppointments.length}
              </strong>

              <p>
                Upcoming appointments
              </p>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              ✓
            </div>

            <div>
              <span>ACCOUNT</span>

              <strong>Active</strong>

              <p>
                Your patient account is ready
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel appointment-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">
                  YOUR APPOINTMENTS
                </span>

                <h2>
                  Upcoming appointments
                </h2>
              </div>

              <Link
                to="/book-appointment"
                className="panel-action"
              >
                + Book
              </Link>
            </div>

            {appointmentsLoading ? (
              <div className="appointments-loading">
                Loading appointments...
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="empty-appointments">
                <div className="empty-icon">
                  <span>+</span>
                </div>

                <h3>
                  No appointments yet
                </h3>

                <p>
                  Book your first laboratory appointment and it will appear
                  here.
                </p>

                <Link
                  to="/book-appointment"
                  className="dashboard-primary-action"
                >
                  Book an Appointment
                  <span>→</span>
                </Link>
              </div>
            ) : (
              <div className="appointment-list">
                {upcomingAppointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="appointment-item"
                  >
                    <div className="appointment-date">
                      <span>
                        {new Date(
                          `${appointment.appointment_date}T00:00:00`,
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                        })}
                      </span>

                      <strong>
                        {new Date(
                          `${appointment.appointment_date}T00:00:00`,
                        ).getDate()}
                      </strong>
                    </div>

                    <div className="appointment-info">
                      <strong>
                        {appointment.service}
                      </strong>

                      <span>
                        {formatDate(appointment.appointment_date)}
                      </span>

                      <span>
                        {formatTime(appointment.appointment_time)}
                      </span>
                    </div>

                    <span
                      className={getStatusClass(
                        appointment.status,
                      )}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-panel account-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">
                  ACCOUNT
                </span>

                <h2>
                  Patient information
                </h2>
              </div>
            </div>

            <div className="account-details">
              <div className="account-detail">
                <span>FULL NAME</span>

                <strong>
                  {fullName}
                </strong>
              </div>

              <div className="account-detail">
                <span>EMAIL ADDRESS</span>

                <strong>
                  {user?.email}
                </strong>
              </div>

              <div className="account-detail">
                <span>ACCOUNT STATUS</span>

                <strong className="account-active">
                  <span />
                  Active
                </strong>
              </div>
            </div>
          </section>
        </div>

        <section className="dashboard-help">
          <div className="help-icon">
            ?
          </div>

          <div>
            <span>NEED ASSISTANCE?</span>

            <strong>
              Contact Al-Azhar Medical Lab
            </strong>

            <p>
              For appointments or laboratory information, contact our team
              directly.
            </p>
          </div>

          <a
            href="tel:+213671333371"
            className="help-button"
          >
            Call Laboratory
            <span>→</span>
          </a>
        </section>
      </section>
    </main>
  )
}

export default Dashboard
