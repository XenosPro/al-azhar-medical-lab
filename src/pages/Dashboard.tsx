import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return
      }

      const { data, error } = await supabase.rpc('is_admin')

      if (error) {
        console.error('Admin check failed:', error)
        return
      }

      setIsAdmin(data === true)
    }

    checkAdmin()
  }, [])

  async function loadDashboard() {
    setLoading(true)

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

    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleCancel(id: string) {
    if (!window.confirm('Cancel this appointment request?')) return

    setActionError('')
    setCancellingId(id)

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('id')

    setCancellingId(null)

    if (error || !data || data.length === 0) {
      setActionError(
        'We could not cancel this appointment. It may already be confirmed. Please call the laboratory.',
      )
      return
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: 'cancelled' }
          : appointment,
      ),
    )
  }

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === 'pending' ||
          appointment.status === 'confirmed',
      ),
    [appointments],
  )

  const completedAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => appointment.status === 'completed',
      ),
    [appointments],
  )

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Patient'

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function formatTime(time: string) {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(Number(hours), Number(minutes), 0, 0)

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function statusLabel(status: Appointment['status']) {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        <div className="dashboard-loader" />
        <p>Loading your dashboard...</p>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-brand">
            <span className="dashboard-brand-mark">
              <span />
              <span />
            </span>

            <span className="dashboard-brand-text">
              <strong>AL-AZHAR</strong>
              <small>MEDICAL LAB</small>
            </span>
          </Link>

          <div className="dashboard-header-actions">
            <span className="dashboard-user-email">{user?.email}</span>

            {isAdmin && (
              <Link
                to="/admin-dashboard"
                className="dashboard-admin-button"
              >
                Admin Dashboard
              </Link>
            )}

            <button
              type="button"
              className="dashboard-signout"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="dashboard-main">
        <div className="dashboard-container">
          <section className="dashboard-welcome">
            <div>
              <p className="dashboard-eyebrow">PATIENT PORTAL</p>

              <h1>
                Welcome back, <span>{displayName}</span>
              </h1>

              <p className="dashboard-welcome-text">
                Manage your appointments and keep track of your laboratory
                visits from one secure place.
              </p>
            </div>

            <div className="dashboard-primary-actions">
              <Link
                to="/book-appointment"
                className="dashboard-primary-button"
              >
                <span>+</span>
                Book an appointment
              </Link>

              <Link
                to="/lab-ai"
                className="dashboard-ai-button"
              >
                <span>✦</span>
                AI CKD Screening
              </Link>
            </div>
          </section>

          <section className="dashboard-stat-grid">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon blue">
                <span>▣</span>
              </div>

              <div>
                <strong>{appointments.length}</strong>
                <span>Total appointments</span>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon teal">
                <span>✓</span>
              </div>

              <div>
                <strong>{upcomingAppointments.length}</strong>
                <span>Upcoming visits</span>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon green">
                <span>◷</span>
              </div>

              <div>
                <strong>{completedAppointments.length}</strong>
                <span>Completed visits</span>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon purple">
                <span>●</span>
              </div>

              <div>
                <strong>Active</strong>
                <span>Account status</span>
              </div>
            </div>
          </section>

          <section className="dashboard-content-grid">
            <div className="dashboard-card appointments-card">
              <div className="dashboard-card-header">
                <div>
                  <p className="dashboard-card-kicker">YOUR SCHEDULE</p>
                  <h2>Upcoming appointments</h2>
                </div>

                <Link
                  to="/book-appointment"
                  className="dashboard-card-link"
                >
                  New appointment →
                </Link>
              </div>

              {actionError && (
                <p className="dashboard-action-error" role="alert">
                  {actionError}
                </p>
              )}

              {upcomingAppointments.length === 0 ? (
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">＋</div>

                  <h3>No upcoming appointments</h3>

                  <p>
                    You currently have no scheduled laboratory visits.
                  </p>

                  <Link
                    to="/book-appointment"
                    className="dashboard-empty-button"
                  >
                    Book an appointment
                  </Link>
                </div>
              ) : (
                <div className="dashboard-appointment-list">
                  {upcomingAppointments.map((appointment) => (
                    <article
                      key={appointment.id}
                      className="dashboard-appointment"
                    >
                      <div className="appointment-date">
                        <strong>
                          {new Date(
                            `${appointment.appointment_date}T00:00:00`,
                          ).getDate()}
                        </strong>

                        <span>
                          {new Date(
                            `${appointment.appointment_date}T00:00:00`,
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                          })}
                        </span>
                      </div>

                      <div className="appointment-details">
                        <div className="appointment-title-row">
                          <h3>{appointment.service}</h3>

                          <span
                            className={`appointment-status ${appointment.status}`}
                          >
                            {statusLabel(appointment.status)}
                          </span>
                        </div>

                        <p>
                          {formatDate(appointment.appointment_date)}
                          <span>•</span>
                          {formatTime(appointment.appointment_time)}
                        </p>

                        {appointment.notes && (
                          <small>{appointment.notes}</small>
                        )}

                        {appointment.status === 'pending' && (
                          <button
                            type="button"
                            className="appointment-cancel"
                            onClick={() => handleCancel(appointment.id)}
                            disabled={cancellingId === appointment.id}
                          >
                            {cancellingId === appointment.id
                              ? 'Cancelling...'
                              : 'Cancel request'}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="dashboard-side-column">
              <div className="dashboard-card patient-card">
                <div className="dashboard-card-header">
                  <div>
                    <p className="dashboard-card-kicker">ACCOUNT</p>
                    <h2>Patient information</h2>
                  </div>
                </div>

                <div className="patient-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="patient-info">
                  <div>
                    <span>Full name</span>
                    <strong>{displayName}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{user?.email}</strong>
                  </div>

                  <div>
                    <span>Account status</span>
                    <strong className="patient-active">
                      <i />
                      Active
                    </strong>
                  </div>
                </div>
              </div>

              <div className="dashboard-help-card">
                <div className="help-icon">?</div>

                <div>
                  <p>Need assistance?</p>
                  <span>Contact the laboratory directly.</span>

                  <a href="tel:0671333371">0671 33 33 71 →</a>
                </div>
              </div>
            </aside>
          </section>

          {appointments.length > 0 && (
            <section className="dashboard-card history-card">
              <div className="dashboard-card-header">
                <div>
                  <p className="dashboard-card-kicker">
                    APPOINTMENT HISTORY
                  </p>
                  <h2>Your recent appointments</h2>
                </div>
              </div>

              <div className="dashboard-history-list">
                {appointments.slice(0, 5).map((appointment) => (
                  <div className="history-row" key={appointment.id}>
                    <div className="history-service">
                      <span className="history-dot" />
                      <strong>{appointment.service}</strong>
                    </div>

                    <span>
                      {formatDate(appointment.appointment_date)}
                    </span>

                    <span className="history-time">
                      {formatTime(appointment.appointment_time)}
                    </span>

                    <span
                      className={`history-status ${appointment.status}`}
                    >
                      {statusLabel(appointment.status)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <footer className="dashboard-footer">
        <div>
          <strong>AL-AZHAR MEDICAL LAB</strong>
          <span>
            Reliable laboratory services in Cherchell, Algeria.
          </span>
        </div>

        <div>
          <span>Rue Frères Saadoun, Cherchell</span>
          <span>0671 33 33 71</span>
        </div>
      </footer>
    </main>
  )
}

export default Dashboard