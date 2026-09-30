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

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setLoading(false)
    }

    checkUser()
  }, [navigate])

  function getToday() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  async function handleBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSuccess(false)

    if (!service || !date || !time) {
      setError('Please complete all required fields.')
      return
    }

    setBooking(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        service,
        appointment_date: date,
        appointment_time: time,
        notes: notes.trim() || null,
        status: 'pending',
      })

    if (error) {
      setError(error.message)
      setBooking(false)
      return
    }

    setSuccess(true)
    setBooking(false)

    setTimeout(() => {
      navigate('/dashboard')
    }, 1800)
  }

  if (loading) {
    return (
      <main className="booking-page">
        <div className="booking-loading">
          Loading booking page...
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="booking-page">
        <div className="booking-success">
          <div className="success-icon">✓</div>

          <span>APPOINTMENT REQUESTED</span>

          <h1>Appointment booked.</h1>

          <p>
            Your appointment request has been successfully submitted.
            Redirecting you to your patient portal...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link to="/dashboard" className="booking-brand">
          <span className="booking-brand-mark">+</span>

          <span>
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
          <span>APPOINTMENTS</span>

          <h1>Book an appointment.</h1>

          <p>
            Select your laboratory service, preferred date, and available
            time.
          </p>
        </div>

        <form
          className="booking-card"
          onSubmit={handleBooking}
        >
          <div className="booking-section">
            <div className="booking-section-heading">
              <span>01</span>
              <div>
                <h2>Choose a service</h2>
                <p>Select the laboratory service you need.</p>
              </div>
            </div>

            <div className="service-grid">
              {services.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`service-option ${
                    service === item ? 'selected' : ''
                  }`}
                  onClick={() => setService(item)}
                >
                  <span className="service-radio">
                    {service === item && <span />}
                  </span>

                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="booking-divider" />

          <div className="booking-section">
            <div className="booking-section-heading">
              <span>02</span>
              <div>
                <h2>Choose a date</h2>
                <p>Select your preferred appointment date.</p>
              </div>
            </div>

            <label className="booking-field">
              <span>APPOINTMENT DATE</span>

              <input
                type="date"
                value={date}
                min={getToday()}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="booking-divider" />

          <div className="booking-section">
            <div className="booking-section-heading">
              <span>03</span>
              <div>
                <h2>Choose a time</h2>
                <p>Select an available appointment time.</p>
              </div>
            </div>

            <div className="time-grid">
              {timeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  className={`time-option ${
                    time === slot ? 'selected' : ''
                  }`}
                  onClick={() => setTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="booking-divider" />

          <div className="booking-section">
            <div className="booking-section-heading">
              <span>04</span>
              <div>
                <h2>Additional information</h2>
                <p>Optional information for the laboratory team.</p>
              </div>
            </div>

            <label className="booking-field">
              <span>NOTES</span>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add any relevant information..."
                rows={4}
              />
            </label>
          </div>

          {error && (
            <div className="booking-error">
              {error}
            </div>
          )}

          <div className="booking-submit-area">
            <div>
              <strong>Ready to book?</strong>
              <span>
                Your request will be saved as pending.
              </span>
            </div>

            <button
              type="submit"
              className="booking-submit"
              disabled={booking || !service || !date || !time}
            >
              {booking ? 'Booking...' : 'Confirm Appointment'}
              {!booking && <span>→</span>}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default BookAppointment
