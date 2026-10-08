import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './AdminDashboard.css'

type Appointment = {
  id: string
  user_id: string | null
  guest_name: string | null
  guest_phone: string | null
  service: string
  appointment_date: string
  appointment_time: string
  status: string
  notes: string | null
  created_at: string
}

type PatientName = {
  user_id: string
  full_name: string
}

function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patientNames, setPatientNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAppointments = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Appointments error:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    const loadedAppointments = data || []

    setAppointments(loadedAppointments)

    const userIds = Array.from(
      new Set(
        loadedAppointments
          .map((appointment) => appointment.user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    )

    console.log('Patient IDs:', userIds)

    if (userIds.length > 0) {
      const { data: patients, error: patientError } =
        await supabase.rpc('get_patient_names', {
          user_ids: userIds,
        })

      console.log('Patient names:', patients)
      console.log('Patient name error:', patientError)

      if (patientError) {
        console.error('Patient names RPC error:', patientError)
        setError(patientError.message)
      } else {
        const names: Record<string, string> = {}

        const patientList = (patients || []) as PatientName[]

        patientList.forEach((patient) => {
          names[patient.user_id] = patient.full_name
        })

        console.log('Patient names map:', names)

        setPatientNames(names)
      }
    } else {
      console.log('No registered patient IDs found.')
      setPatientNames({})
    }

    setLoading(false)
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const updateStatus = async (
    appointmentId: string,
    status: string,
  ) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)

    if (error) {
      alert(error.message)
      return
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status }
          : appointment,
      ),
    )
  }

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === 'pending',
  ).length

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === 'confirmed',
  ).length

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === 'cancelled',
  ).length

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          Loading appointments...
        </div>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-label">
            AL-AZHAR MEDICAL LAB
          </span>

          <h1>Admin Dashboard</h1>

          <p>Manage patient appointment requests.</p>
        </div>

        <button
          className="admin-refresh"
          onClick={loadAppointments}
        >
          Refresh
        </button>
      </header>

      {error && (
        <div className="admin-error">
          <strong>Could not load appointments</strong>
          <span>{error}</span>
        </div>
      )}

      <section className="admin-stats">
        <div className="admin-stat">
          <span>Total</span>
          <strong>{appointments.length}</strong>
        </div>

        <div className="admin-stat">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="admin-stat">
          <span>Confirmed</span>
          <strong>{confirmedCount}</strong>
        </div>

        <div className="admin-stat">
          <span>Cancelled</span>
          <strong>{cancelledCount}</strong>
        </div>
      </section>

      <section className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <span className="admin-label">
              APPOINTMENTS
            </span>

            <h2>Appointment requests</h2>
          </div>

          <span className="appointment-count">
            {appointments.length} records
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="empty-state">
            <strong>No appointments yet</strong>

            <p>
              New appointment requests will appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => {
                  const isGuest = !appointment.user_id

                  let patientName = 'Unknown patient'

                  if (isGuest) {
                    patientName =
                      appointment.guest_name ||
                      'Unknown patient'
                  } else if (
                    appointment.user_id &&
                    patientNames[appointment.user_id]
                  ) {
                    patientName =
                      patientNames[appointment.user_id]
                  } else {
                    patientName = 'Registered patient'
                  }

                  return (
                    <tr key={appointment.id}>
                      <td>
                        <div className="patient-cell">
                          <strong>{patientName}</strong>

                          {appointment.guest_phone && (
                            <small>
                              {appointment.guest_phone}
                            </small>
                          )}
                        </div>
                      </td>

                      <td>{appointment.service}</td>

                      <td>
                        {new Date(
                          `${appointment.appointment_date}T00:00:00`,
                        ).toLocaleDateString('en-GB')}
                      </td>

                      <td>
                        {appointment.appointment_time.slice(0, 5)}
                      </td>

                      <td>
                        <span
                          className={`appointment-type ${
                            isGuest ? 'guest' : 'registered'
                          }`}
                        >
                          {isGuest ? 'Guest' : 'Patient'}
                        </span>
                      </td>

                      <td>
                        <select
                          className={`status-select status-${appointment.status}`}
                          value={appointment.status}
                          onChange={(event) =>
                            updateStatus(
                              appointment.id,
                              event.target.value,
                            )
                          }
                        >
                          <option value="pending">
                            Pending
                          </option>

                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminDashboard

