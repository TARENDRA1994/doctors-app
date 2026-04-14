'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface LinkedPatientRecord {
  id: number
  doctor: {
    id: number
    name: string
    clinicName: string
    mobileNumber: string
  }
  prescriptionSharedAt: string | null
  disease: string | null
  status: string
  createdAt: string
}

export default function PatientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<LinkedPatientRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Appointment Modal
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/p/login')
    } else if (status === 'authenticated') {
      if ((session.user as any).role !== 'PATIENT') {
        router.push('/dashboard') // redirect doctors to their dashboard
      } else {
        fetchRecords()
      }
    }
  }, [status, router])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/p/records')
      if (res.ok) {
        setRecords(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch patient records', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingLoading(true)

    try {
      // Format standard time to 12-hour AM/PM
      const [hours, minutes] = appointmentTime.split(':')
      const hourNum = parseInt(hours)
      const ampm = hourNum >= 12 ? 'PM' : 'AM'
      const displayHour = hourNum % 12 || 12
      const formattedTime = `${displayHour}:${minutes} ${ampm}`

      // Format date
      const dateObj = new Date(appointmentDate)
      const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      const combinedProposedString = `${formattedDate} at ${formattedTime}`

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          proposedTime: combinedProposedString,
          bookedBy: 'PATIENT'
        })
      })

      if (response.ok) {
        alert('Appointment request sent successfully! The doctor will confirm it.')
        setShowAppointmentModal(false)
        setAppointmentDate('')
        setAppointmentTime('')
      } else {
        alert('Failed to send appointment request.')
      }
    } catch (err) {
      console.error('Booking error', err)
      alert('An error occurred during booking.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-medical-50 flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {(session.user?.name || 'P').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Hello, {session.user?.name}</h1>
                <p className="text-xs text-gray-500">Patient Portal</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: `${window.location.origin}/p/login` })}
              className="text-sm text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your Doctors & Records</h2>
          <p className="text-gray-500 text-sm">View your prescriptions and manage appointments across clinics.</p>
        </div>

        {records.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 shadow-sm">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No records found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Your mobile number is not linked to any existing clinic records. If your doctor has registered you, ensure they used this mobile number: <strong className="text-gray-800">{(session.user as any).mobileNumber}</strong>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map(record => (
              <div key={record.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Dr. {record.doctor.name}</h3>
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-medical-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    {record.doctor.clinicName}
                  </p>
                  {record.disease && (
                    <div className="mt-3 inline-block bg-white text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600">
                      Condition: <span className="font-bold text-gray-800">{record.disease}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Prescription Section */}
                  <div className="bg-medical-50 p-4 rounded-2xl border border-medical-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-medical-800 text-sm">Medical Prescription</h4>
                      {record.prescriptionSharedAt ? (
                        <p className="text-xs text-medical-600 mt-0.5">Updated: {new Date(record.prescriptionSharedAt).toLocaleDateString()}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-0.5">Not shared yet</p>
                      )}
                    </div>
                    {record.prescriptionSharedAt ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => window.open(`/api/prescriptions/pdf?patientId=${record.id}`, '_blank')}
                          className="bg-medical-50 text-medical-700 border border-medical-200 text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-medical-100 transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          Preview
                        </button>
                        <button 
                          onClick={() => window.open(`/api/prescriptions/pdf?patientId=${record.id}&download=true`, '_blank')}
                          className="bg-medical-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-medical-700 transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                        Unavailable
                      </span>
                    )}
                  </div>

                  {/* Appointment Button */}
                  <button
                    onClick={() => {
                      setSelectedDoctorId(record.doctor.id)
                      setSelectedPatientId(record.id)
                      setShowAppointmentModal(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Book Appointment</h3>
            <p className="text-sm text-gray-500 mb-6">Select a date and time to request an appointment with your doctor.</p>
            
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-500 outline-none"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-3 text-sm font-bold text-white bg-medical-600 rounded-xl hover:bg-medical-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {bookingLoading ? 'Sending...' : 'Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
