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

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

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

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { error } = await supabase.from('appointments').insert({
      user_id: user.id,
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
      'Your appointment request has been submitted successfully.',
    )

    setLoading(false)

    setTimeout(() => {
      navigate('/dashboard')
    }, 1600)
  }

  const today = new Date().toISOString().split('T')[0]

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
        <Link to="/dashboard" className="booking-brand">
          <span className="booking-brand-mark">
            <span />
          </span>

          <span className="booking-brand-text">
            <strong>AL-AZHAR</strong>
            <small>MEDICAL LAB</small>
          </span>
        </Link>

        <Link to="/dashboard" className="booking-back">
          ← Dashboard
        </Link>
      </header>

      <section className="booking-content">
        <div className="booking-intro">
          <p className="booking-eyebrow">PATIENT PORTAL</p>

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
                <small>Choose a service and preferred time.</small>
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
                <strong>Easy management</strong>
                <small>Track your request from your dashboard.</small>
              </div>
            </div>
          </div>
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
              disabled={loading}
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
