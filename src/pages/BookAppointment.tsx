import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './BookAppointment.css'

const services = [
  'Blood Test',
  'Urine Test',
  'Routine Laboratory Test',
  'Other',
]

const timeSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
]

function BookAppointment() {
  const navigate = useNavigate()

  const [userId, setUserId] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  // Login is optional: a signed-in patient is linked to the appointment,
  // anyone else books as a guest.
  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUserId(user?.id ?? null)
    setCheckingUser(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!service || !date || !time) {
      setError('Please complete all required fields.')
      return
    }

    if (!userId && (!guestName.trim() || !guestPhone.trim())) {
      setError('Please enter your full name and phone number.')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('appointments').insert({
      user_id: userId,
      guest_name: userId ? null : guestName.trim(),
      guest_phone: userId ? null : guestPhone.trim(),
      service,
      appointment_date: date,
      appointment_time: time,
      notes: notes.trim() || null,
      status: 'pending',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(
      userId
        ? 'Your appointment request has been submitted successfully.'
        : 'Your appointment request has been submitted. The laboratory will contact you by phone to confirm.',
    )

    setLoading(false)

    setTimeout(() => {
      navigate(userId ? '/dashboard' : '/')
    }, 2200)
  }

  const today = new Date().toISOString().split('T')[0]
  const homeLink = userId ? '/dashboard' : '/'

  if (checkingUser) {
    return (
      <main className="booking-loading">
        <div className="booking-loader" />
        <p>Preparing your appointment form...</p>
      </main>
    )
  }

  return (
    <main className="booking-page">
      <div className="booking-background">
        <div className="booking-glow booking-glow-one" />
        <div className="booking-glow booking-glow-two" />
        <div className="booking-grid" />
      </div>

      <header className="booking-header">
        <Link to={homeLink} className="booking-brand">
          <span className="booking-brand-mark">
            <span />
          </span>

          <span className="booking-brand-text">
            <strong>AL-AZHAR</strong>
            <small>MEDICAL LAB</small>
          </span>
        </Link>

        <Link to={homeLink} className="booking-back">
          {userId ? '← Dashboard' : '← Home'}
        </Link>
      </header>

      <section className="booking-content">
        <div className="booking-intro">
          <p className="booking-eyebrow">
            {userId ? 'PATIENT PORTAL' : 'ONLINE BOOKING'}
          </p>

          <h1>
            Book your
            <span> laboratory visit.</span>
          </h1>

          <p>
            Select your preferred service, date, and time. Your request will
            be submitted to the laboratory for confirmation.
          </p>

          <div className="booking-info-list">
            <div>
              <span className="booking-info-icon">✓</span>
              <div>
                <strong>Simple booking</strong>
                <small>No account needed. Choose a service and time.</small>
              </div>
            </div>

            <div>
              <span className="booking-info-icon">◷</span>
              <div>
                <strong>Flexible scheduling</strong>
                <small>Select from the available time slots.</small>
              </div>
            </div>

            <div>
              <span className="booking-info-icon">↗</span>
              <div>
                <strong>
                  {userId ? 'Easy management' : 'Confirmation by phone'}
                </strong>
                <small>
                  {userId
                    ? 'Track your request from your dashboard.'
                    : 'The laboratory will call you to confirm.'}
                </small>
              </div>
            </div>
          </div>

          {!userId && (
            <p className="booking-disclaimer">
              Have an account? <Link to="/login">Sign in</Link> to track your
              appointments from your dashboard.
            </p>
          )}
        </div>

        <div className="booking-card">
          <div className="booking-card-header">
            <div>
              <p>APPOINTMENT REQUEST</p>
              <h2>Choose your visit details</h2>
            </div>

            <span className="booking-secure">
              <i />
              Secure
            </span>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            {!userId && (
              <div className="booking-form-row">
                <div className="booking-field">
                  <label htmlFor="guestName">
                    Full name
                    <span>*</span>
                  </label>

                  <input
                    id="guestName"
                    type="text"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="guestPhone">
                    Phone number
                    <span>*</span>
                  </label>

                  <input
                    id="guestPhone"
                    type="tel"
                    value={guestPhone}
                    onChange={(event) => setGuestPhone(event.target.value)}
                    autoComplete="tel"
                    placeholder="0671 33 33 71"
                    maxLength={20}
                    required
                  />
                </div>
              </div>
            )}

            <div className="booking-field">
              <label htmlFor="service">
                Laboratory service
                <span>*</span>
              </label>

              <select
                id="service"
                value={service}
                onChange={(event) => setService(event.target.value)}
                required
              >
                <option value="">Select a service</option>

                {services.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-form-row">
              <div className="booking-field">
                <label htmlFor="date">
                  Preferred date
                  <span>*</span>
                </label>

                <input
                  id="date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>

              <div className="booking-field">
                <label htmlFor="time">
                  Preferred time
                  <span>*</span>
                </label>

                <select
                  id="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  required
                >
                  <option value="">Select a time</option>

                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="booking-field">
              <div className="booking-label-row">
                <label htmlFor="notes">Additional notes</label>
                <span>Optional</span>
              </div>

              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add any information you would like the laboratory to know..."
                rows={4}
                maxLength={500}
              />

              <small className="booking-character-count">
                {notes.length}/500
              </small>
            </div>

            {error && (
              <div className="booking-message booking-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="booking-message booking-success">
                <span>✓</span>
                <p>{success}</p>
              </div>
            )}

            <button
              type="submit"
              className="booking-submit"
              disabled={loading || Boolean(success)}
            >
              {loading ? (
                <>
                  <span className="booking-spinner" />
                  Submitting request...
                </>
              ) : (
                <>
                  Submit appointment request
                  <span>→</span>
                </>
              )}
            </button>

            <p className="booking-disclaimer">
              Submitting this form creates a pending appointment request.
              The laboratory may contact you to confirm the appointment.
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default BookAppointment
