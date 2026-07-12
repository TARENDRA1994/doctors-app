'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import RestrictionOverlay from './components/RestrictionOverlay'
import StatCards from './components/StatCards'
import ReportsView from './components/ReportsView'
import ProfileView from './components/ProfileView'
import QueueView from './components/QueueView'
import { 
  Users, 
  Bell, 
  BarChart3, 
  LayoutDashboard, 
  Plus, 
  Calendar, 
  Search,
  User as UserIcon 
} from 'lucide-react'

interface Patient {
  id: number
  name: string
  mobileNumber: string
  guardianNumber: string | null
  age: number | null
  disease: string | null
  medicines: Medicine[]
}

interface Medicine {
  id: number
  name: string
  dosage: string
  frequency: number
  reminderTime: string
  schedules: Schedule[]
}

interface Schedule {
  id: number
  scheduledAt: string
  status: string
}

interface MedicineFormItem {
  name: string
  dosage: string
  quantity: string
  frequency: string
  reminderTimes: string[]
  startDate: string
  endDate: string
  instructions: string
}

interface Feedback {
  id: number
  patient: { id: number; name: string; mobileNumber: string }
  medicine: { name: string; dosage: string }
  status: 'feeling_ok' | 'no_improvement'
  notes: string | null
  isRead: boolean
  createdAt: string
}

interface Appointment {
  id: number
  patient: { name: string; mobileNumber: string }
  proposedTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'ARCHIVED'
  createdAt: string
}

const getDefaultTimes = (freq: number): string[] => {
  switch (freq) {
    case 1: return ['08:00']
    case 2: return ['08:00', '20:00']
    case 3: return ['08:00', '14:00', '20:00']
    case 4: return ['06:00', '12:00', '18:00', '22:00']
    default: return ['08:00']
  }
}

const emptyMedicine = (): MedicineFormItem => ({
  name: '',
  dosage: '',
  quantity: '1',
  frequency: '1',
  reminderTimes: ['08:00'],
  startDate: '',
  endDate: '',
  instructions: '',
})

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showAddMedicine, setShowAddMedicine] = useState(false)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  const [appointmentForm, setAppointmentForm] = useState({ patientId: 0, proposedDate: '', proposedTime: '' })
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState<'overview' | 'patients' | 'notifications' | 'reports' | 'profile' | 'queue'>('overview')
  const [showMetricModal, setShowMetricModal] = useState<'patients' | 'medicines' | 'reminders' | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [queueActionLoading, setQueueActionLoading] = useState<number | null>(null)

  const handleQueueAction = async (patientId: number, action: 'resend' | 'delete') => {
    setQueueActionLoading(patientId)
    try {
      const response = await fetch('/api/reminders/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, action })
      })
      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: data.message })
        fetchDashboardData()
      } else {
        setMessage({ type: 'error', text: 'Action failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setQueueActionLoading(null)
    }
  }

  const [patientForm, setPatientForm] = useState({
    name: '',
    mobileNumber: '',
    guardianNumber: '',
    age: '',
    disease: '',
    weight: '',
    height: '',
    foodPreference: '',
    allergies: '',
    activityLevel: '',
  })

  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [medicines, setMedicines] = useState<MedicineFormItem[]>([emptyMedicine()])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients)
        setFeedbacks(data.feedbacks)
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setMessage({ type: 'error', text: 'Failed to fetch dashboard data' })
    } finally {
      setLoading(false)
    }
  }

  const markFeedbackAsRead = async (id: number) => {
    try {
      await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true })
      })
      // Optimistically update UI
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, isRead: true } : f))
    } catch (error) {
      console.error('Error marking feedback as read', error)
    }
  }

  const handleSuggestAppointment = (patientId: number) => {
    setAppointmentForm({ patientId, proposedDate: '', proposedTime: '' })
    setShowAddAppointment(true)
  }

  const addMedicineCard = () => {
    setMedicines([...medicines, emptyMedicine()])
  }

  const removeMedicineCard = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index))
    }
  }

  const updateMedicine = (index: number, field: string, value: string) => {
    const updated = [...medicines]
    if (field === 'frequency') {
      const freq = parseInt(value)
      updated[index].frequency = value
      updated[index].reminderTimes = getDefaultTimes(freq)
    } else {
      ; (updated[index] as any)[field] = value
    }
    setMedicines(updated)
  }

  const updateReminderTime = (medIndex: number, timeIndex: number, value: string) => {
    const updated = [...medicines]
    updated[medIndex].reminderTimes[timeIndex] = value
    setMedicines(updated)
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchDashboardData()

      // Auto-refresh every 30 seconds for "live" updates (increased from 10s to reduce DB load)
      const interval = setInterval(() => {
        fetchDashboardData()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [session])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const isRestricted = !session.user.isAdmin && session.user.subscriptionStatus === 'INACTIVE'

  if (isRestricted) {
    return <RestrictionOverlay />
  }



  const deletePatient = async (id: number) => {
    if (!confirm('Are you sure you want to mark this patient as inactive?')) return
    try {
      setLoading(true)
      const response = await fetch(`/api/patients/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setMessage({ type: 'success', text: 'Patient marked as inactive' })
        fetchDashboardData()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to delete patient' })
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitSuggestedAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Convert standard HTML time (e.g. 14:30) to 12-hour AM/PM format
      const [hours, minutes] = appointmentForm.proposedTime.split(':')
      const hourNum = parseInt(hours)
      const ampm = hourNum >= 12 ? 'PM' : 'AM'
      const displayHour = hourNum % 12 || 12
      const formattedTime = `${displayHour}:${minutes} ${ampm}`

      // Format date
      const dateObj = new Date(appointmentForm.proposedDate)
      const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

      const combinedProposedString = `${formattedDate} at ${formattedTime}`

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: appointmentForm.patientId,
          proposedTime: combinedProposedString
        })
      })
      if (response.ok) {
        setMessage({ type: 'success', text: 'Appointment invitation sent to patient!' })
        setShowAddAppointment(false)
        fetchDashboardData()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to send invitation' })
      }
    } catch (error) {
      console.error('Error creating appt:', error)
    } finally {
      setLoading(false)
    }
  }

  const archiveAppointment = async (id: number) => {
    try {
      const response = await fetch(`/api/appointments/${id}/archive`, { method: 'POST' })
      if (response.ok) fetchDashboardData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!patientForm.name || !patientForm.mobileNumber) {
        setMessage({ type: 'error', text: 'Please fill in required fields' })
        setLoading(false)
        return
      }

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...patientForm,
          age: patientForm.age ? parseInt(patientForm.age) : null,
          weight: patientForm.weight ? parseFloat(patientForm.weight) : null,
          height: patientForm.height ? parseFloat(patientForm.height) : null,
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.isExisting) {
          setMessage({ type: 'success', text: 'Patient already exists. Redirecting to profile...' })
          setTimeout(() => {
            router.push(`/patient/${data.id}`)
          }, 1500)
        } else {
          setMessage({ type: 'success', text: 'Patient added successfully!' })
          setShowAddPatient(false)
          setPatientForm({ name: '', mobileNumber: '', guardianNumber: '', age: '', disease: '', weight: '', height: '', foodPreference: '', allergies: '', activityLevel: '' })
          fetchDashboardData()
        }
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to add patient' })
      }
    } catch (error) {
      console.error('Error adding patient:', error)
      setMessage({ type: 'error', text: 'An error occurred while adding patient' })
    } finally {
      setLoading(false)
    }
  }

  const handleTestNotification = async () => {
    setLoading(true)
    console.log('📩 Sending test notification...')
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      console.log('📩 Test notification response:', response.status, data)

      if (response.ok) {
        setMessage({ type: 'success', text: `Test notification sent to ${data.recipientNumber || 'your WhatsApp'}!` })
      } else {
        console.error('❌ Test notification failed:', data)
        setMessage({ type: 'error', text: data.error || 'Failed to send test notification' })
      }
    } catch (error) {
      console.error('❌ Test notification request error:', error)
      setMessage({ type: 'error', text: 'An error occurred while sending test notification' })
    } finally {
      setLoading(false)
    }
  }


  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!selectedPatientId) {
        setMessage({ type: 'error', text: 'Please select a patient' })
        setLoading(false)
        return
      }

      let allSuccess = true
      for (const med of medicines) {
        if (!med.name || !med.dosage || !med.startDate || !med.endDate) {
          setMessage({ type: 'error', text: 'Please fill in all required fields for each medicine' })
          setLoading(false)
          return
        }

        // Join multiple times with comma for the backend
        const finalReminderTime = med.reminderTimes.join(',')
        // Combine dosage with quantity for display
        const fullDosage = med.quantity && parseInt(med.quantity) > 1
          ? `${med.dosage} × ${med.quantity} tablets`
          : med.dosage

        const response = await fetch('/api/medicines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: med.name,
            dosage: fullDosage,
            reminderTime: finalReminderTime,
            frequency: parseInt(med.frequency),
            patientId: parseInt(selectedPatientId),
            startDate: med.startDate,
            endDate: med.endDate,
            instructions: med.instructions,
          })
        })

        if (!response.ok) {
          allSuccess = false
          const error = await response.json()
          setMessage({ type: 'error', text: error.error || `Failed to add ${med.name}` })
          break
        }
      }

      if (allSuccess) {
        setMessage({ type: 'success', text: `${medicines.length} medicine(s) added and WhatsApp notification sent!` })
        setShowAddMedicine(false)
        setMedicines([emptyMedicine()])
        setSelectedPatientId('')
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error adding medicine:', error)
      setMessage({ type: 'error', text: 'An error occurred while adding medicine' })
    } finally {
      setLoading(false)
    }
  }

  // Stats calculations
  const totalPatients = patients.length
  const totalMedicines = patients.reduce((acc, p) => acc + p.medicines.length, 0)
  const pendingReminders = patients.reduce((acc, p) =>
    acc + p.medicines.reduce((macc, m) =>
      macc + m.schedules.filter(s => s.status === 'pending').length, 0
    ), 0
  )


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-medical-50/20 to-accent-50/20 text-gray-900">
      {/* ═══════════ HEADER ═══════════ */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-medical-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveView('overview')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-accent-600 rounded-xl flex items-center justify-center shadow-medical group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-medical-600">DoctorsNode</h1>
                <p className="text-xs text-gray-400 -mt-0.5 hidden sm:block">Doctor&apos;s Dashboard</p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notification Badge */}
              <div
                className="relative cursor-pointer mr-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setActiveView('notifications')}
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {feedbacks.filter(f => !f.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[10px] text-white font-bold items-center justify-center">
                      {feedbacks.filter(f => !f.isRead).length}
                    </span>
                  </span>
                )}
              </div>

              <div className="hidden sm:block text-right mr-2">
                <p className="text-sm font-semibold text-gray-800">{session.user?.name || 'Doctor'}</p>
                <p className="text-xs text-gray-400">{session.user?.email}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-medical-400 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {(session.user?.name || 'D').charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin}/login` })}
                className="ml-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ MESSAGE TOAST ═══════════ */}
      {message && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up max-w-sm">
          <div className={`p-4 rounded-xl shadow-lg flex items-center gap-3 ${message.type === 'success'
            ? 'bg-accent-50 border border-accent-200 text-accent-800'
            : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
            {message.type === 'success' ? (
              <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW: OVERVIEW */}
        {activeView === 'overview' && (
          <div className="animate-fade-in space-y-10">
            {/* Stats Cards */}
            <StatCards
              totalPatients={totalPatients}
              totalMedicines={totalMedicines}
              pendingReminders={pendingReminders}
              onTotalPatientsClick={() => setShowMetricModal('patients')}
              onTotalMedicinesClick={() => setShowMetricModal('medicines')}
              onPendingRemindersClick={() => setShowMetricModal('reminders')}
            />

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveView('patients')}
                className="bg-gradient-to-br from-medical-500 to-medical-600 rounded-2xl p-6 text-white cursor-pointer shadow-medical hover:shadow-medical-lg transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Patients</h3>
                    <p className="text-medical-100 text-sm">Manage {patients.length} patients</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveView('queue')}
                className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Token Queue</h3>
                    <p className="text-indigo-100 text-sm">Manage Walk-ins</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveView('reports')}
                className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 text-white cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Clinical Reports</h3>
                    <p className="text-accent-100 text-sm">Insights & Analytics</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveView('profile')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-white cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Doctor Profile</h3>
                    <p className="text-gray-300 text-sm">Update Professional Info</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div
                onClick={() => router.push('/dashboard/chat')}
                className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h3 className="text-xl font-bold mb-1">AI Assistant</h3>
                    <p className="text-purple-100 text-sm">Chat with Llama 3</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-[2rem] p-8 border border-medical-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <Bell className="text-amber-500" />
                    Pending Attention
                  </h3>
                  <button onClick={() => setActiveView('notifications')} className="text-sm font-bold text-medical-600 hover:underline">View All</button>
                </div>
                
                <div className="space-y-4">
                  {feedbacks.filter(f => !f.isRead).length === 0 && appointments.filter(a => ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(a.status)).length === 0 ? (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium">No pending alerts. You're all caught up!</p>
                    </div>
                  ) : (
                    <>
                      {feedbacks.filter(f => !f.isRead).slice(0, 3).map(f => (
                        <div key={f.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{f.status === 'no_improvement' ? '😕' : '😊'}</span>
                            <div className="text-sm">
                              <p className="font-bold text-gray-800 group-hover:text-medical-600 transition-colors uppercase tracking-tight">{f.patient.name}</p>
                              <p className="text-xs text-gray-500 font-bold">{f.medicine.name}</p>
                            </div>
                          </div>
                          <button onClick={() => markFeedbackAsRead(f.id)} className="p-2 hover:bg-medical-50 rounded-lg transition-colors text-medical-600 border border-transparent hover:border-medical-100">
                            <Plus className="rotate-45" size={18} />
                          </button>
                        </div>
                      ))}
                      {appointments.filter(a => a.status === 'PENDING').slice(0, 3).map(a => (
                        <div key={`apt-${a.id}`} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100 group">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">⏳</span>
                            <div className="text-sm">
                              <p className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{a.patient.name}</p>
                              <p className="text-xs text-orange-500 font-bold">Appt Proposed: {a.proposedTime}</p>
                            </div>
                          </div>
                          <button onClick={() => archiveAppointment(a.id)} className="p-2 hover:bg-orange-100 rounded-lg transition-colors text-orange-600 border border-transparent hover:border-orange-200">
                            <Plus className="rotate-45" size={18} />
                          </button>
                        </div>
                      ))}
                      {appointments.filter(a => a.status === 'CONFIRMED').slice(0, 3).map(a => (
                        <div key={`aptc-${a.id}`} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100 group">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">✅</span>
                            <div className="text-sm">
                              <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors uppercase tracking-tight">{a.patient.name}</p>
                              <p className="text-xs text-green-600 font-bold">Appt Confirmed: {a.proposedTime}</p>
                            </div>
                          </div>
                          <button onClick={() => archiveAppointment(a.id)} className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 border border-transparent hover:border-green-200">
                            <Plus className="rotate-45" size={18} />
                          </button>
                        </div>
                      ))}
                      {appointments.filter(a => a.status === 'RESCHEDULED').slice(0, 3).map(a => (
                        <div key={`aptr-${a.id}`} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100 group">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🔄</span>
                            <div className="text-sm">
                              <p className="font-bold text-gray-800 group-hover:text-red-600 transition-colors uppercase tracking-tight">{a.patient.name}</p>
                              <p className="text-xs text-red-500 font-bold">Needs New Time (was {a.proposedTime})</p>
                            </div>
                          </div>
                          <button onClick={() => archiveAppointment(a.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 border border-transparent hover:border-red-200">
                            <Plus className="rotate-45" size={18} />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons Hub */}
              <div className="space-y-6">
                <div className="bg-medical-600 rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-40 bg-white/10 rounded-full translate-x-12 -translate-y-12 rotate-45 group-hover:scale-125 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2">Practice Growth</h4>
                    <p className="text-medical-100 text-sm mb-8 leading-relaxed">Add new patients to your practice and set automated medication reminders.</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => setShowAddPatient(true)}
                        className="flex-1 py-4 bg-white text-medical-600 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg hover:shadow-white/20 transition-all active:scale-95"
                      >
                        Add Patient
                      </button>
                      <button 
                        onClick={() => setShowAddMedicine(true)}
                        className="flex-1 py-4 bg-medical-500/30 text-white border border-white/20 backdrop-blur-sm rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                      >
                        Medicine
                      </button>
                      <button 
                        onClick={() => setShowAddAppointment(true)}
                        className="flex-1 py-4 bg-blue-500/30 text-white border border-white/20 backdrop-blur-sm rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-gray-100/10 transition-all active:scale-95"
                      >
                        Appt
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-[2rem] p-8 border border-medical-100 shadow-sm flex flex-col gap-4 group hover:border-medical-300 transition-all cursor-pointer" onClick={handleTestNotification}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Test Notification</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Preview Prescription Header</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-amber-500 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-400 font-medium">Limit: 3 tests</div>
                </div>

                {/* Today's Schedule Calendar View */}
                <div className="bg-white rounded-[2rem] p-8 border border-medical-100 shadow-sm">
                  <h4 className="font-black text-gray-800 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-medical-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Today's Schedule
                  </h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {(() => {
                      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      const todaysAppts = appointments.filter(a => a.proposedTime.startsWith(todayStr));
                      if (todaysAppts.length === 0) {
                        return <p className="text-gray-400 text-sm font-medium text-center py-6 border border-dashed border-gray-200 rounded-2xl">No appointments scheduled for today.</p>;
                      }
                      
                      return todaysAppts.map(appt => {
                        const timeOnly = appt.proposedTime.split(' at ')[1] || appt.proposedTime;
                        return (
                          <div key={appt.id} className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-medical-200 bg-gray-50 hover:bg-white transition-all">
                            <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-gray-200 pr-4">
                              <span className="text-sm font-black text-medical-600 text-center">{timeOnly}</span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{appt.patient.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${appt.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                                <span className="text-xs font-bold text-gray-500">{appt.status}</span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: REPORTS */}
        {activeView === 'reports' && <ReportsView />}

        {/* VIEW: PROFILE */}
        {activeView === 'profile' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setActiveView('overview')}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium border border-gray-200 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </button>
            <ProfileView />
          </div>
        )}

        {/* VIEW: QUEUE */}
        {activeView === 'queue' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setActiveView('overview')}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium border border-gray-200 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </button>
            <QueueView />
          </div>
        )}

        {/* VIEW: NOTIFICATIONS */}
        {activeView === 'notifications' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setActiveView('overview')}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium border border-gray-200 px-4 py-2 rounded-xl bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </button>
            <div className="medical-card p-8">
               <h2 className="section-header mb-8">Activity & Feedback Log</h2>
               <div className="space-y-6">
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium tracking-tight">No feedback notifications received yet.</p>
                    </div>
                  ) : (
                    feedbacks.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:border-medical-200 transition-all group shadow-sm">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${f.status === 'feeling_ok' ? 'bg-green-50 text-green-600 shadow-sm border border-green-100' : 'bg-amber-50 text-amber-600 shadow-sm border border-amber-100'}`}>
                            {f.patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-lg uppercase tracking-tight">{f.patient.name}</p>
                            <p className="text-sm text-gray-500 font-bold">{f.medicine.name} • {f.status.replace('_', ' ')}</p>
                            {f.notes && <p className="text-xs text-gray-400 italic mt-1.5 font-medium">&ldquo;{f.notes}&rdquo;</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {!f.isRead && (
                            <button onClick={() => markFeedbackAsRead(f.id)} className="px-5 py-2.5 bg-medical-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">Mark Read</button>
                          )}
                          <span className="text-xs text-gray-400 font-black uppercase tracking-widest">{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        )}

        {/* VIEW: PATIENTS */}
        {activeView === 'patients' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setActiveView('overview')}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium border border-gray-200 px-4 py-2 rounded-xl bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="section-header">Patients List</h2>
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search by name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-medical-100 rounded-2xl focus:ring-2 focus:ring-medical-500 shadow-sm transition-all outline-none"
                />
                <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.mobileNumber.includes(searchQuery)
              ).map((patient) => (
                <div
                  key={patient.id}
                  className="medical-card p-6 cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all group"
                  onClick={() => router.push(`/patient/${patient.id}`)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-medical-50 text-header-600 rounded-[1.25rem] flex items-center justify-center font-black text-xl border border-medical-100">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-800 text-lg group-hover:text-medical-600 transition-colors uppercase tracking-tight">{patient.name}</h3>
                        <p className="text-sm text-gray-400 font-bold">{patient.mobileNumber}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {patient.disease && <span className="text-[10px] font-black uppercase tracking-widest bg-medical-50 text-medical-700 px-3 py-1.5 rounded-lg border border-medical-100/50">{patient.disease}</span>}
                    {patient.age && <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg border border-gray-100">{patient.age}y</span>}
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">
                        {patient.medicines.length} Medicines assigned
                      </span>
                    </div>
                    <span className="text-medical-600 font-black text-[10px] uppercase tracking-widest hover:underline">View Profile →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {
        showAddPatient && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
              <div className="bg-medical-600 p-6 text-white">
                <h3 className="text-xl font-bold">Add New Patient</h3>
                <p className="text-medical-100 text-sm opacity-80">Enter patient details below</p>
              </div>
              <form onSubmit={handleAddPatient} className="p-6 space-y-4">
                <div className="space-y-4">
                  <input type="text" placeholder="Patient Name" value={patientForm.name} onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} className="medical-input" required />
                  <input type="tel" placeholder="WhatsApp Number" value={patientForm.mobileNumber} onChange={(e) => setPatientForm({ ...patientForm, mobileNumber: e.target.value })} className="medical-input" required />
                  <input type="tel" placeholder="Guardian Number (Optional)" value={patientForm.guardianNumber} onChange={(e) => setPatientForm({ ...patientForm, guardianNumber: e.target.value })} className="medical-input" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Age" value={patientForm.age} onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })} className="medical-input" />
                    <input type="text" placeholder="Condition" value={patientForm.disease} onChange={(e) => setPatientForm({ ...patientForm, disease: e.target.value })} className="medical-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="0.1" placeholder="Weight (kg)" value={patientForm.weight} onChange={(e) => setPatientForm({ ...patientForm, weight: e.target.value })} className="medical-input" />
                    <input type="number" step="0.1" placeholder="Height (cm)" value={patientForm.height} onChange={(e) => setPatientForm({ ...patientForm, height: e.target.value })} className="medical-input" />
                  </div>
                  <select value={patientForm.foodPreference} onChange={(e) => setPatientForm({ ...patientForm, foodPreference: e.target.value })} className="medical-input">
                    <option value="">Food Preference (Optional)</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                  <input type="text" placeholder="Allergies (Optional)" value={patientForm.allergies} onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })} className="medical-input" />
                  <select value={patientForm.activityLevel} onChange={(e) => setPatientForm({ ...patientForm, activityLevel: e.target.value })} className="medical-input">
                    <option value="">Activity Level (Optional)</option>
                    <option value="Sedentary">Sedentary</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading} className="flex-1 btn-medical">{loading ? 'Adding...' : 'Add Patient'}</button>
                  <button type="button" onClick={() => setShowAddPatient(false)} className="flex-1 btn-medical-outline">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {
        showAddMedicine && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
              <div className="bg-accent-600 p-6 text-white flex-shrink-0">
                <h3 className="text-xl font-bold">Assign Medicine</h3>
                <p className="text-accent-100 text-sm opacity-80">Add one or more medicines for the patient</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Select Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="medical-input"
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-6">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicineCard(idx)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors z-10 border border-red-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medicine Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Paracetamol"
                            value={med.name}
                            onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                            className="medical-input"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dosage</label>
                            <input
                              type="text"
                              placeholder="e.g. 500mg"
                              value={med.dosage}
                              onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                              className="medical-input"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity/Time</label>
                            <input
                              type="number"
                              placeholder="Qty"
                              value={med.quantity}
                              onChange={(e) => updateMedicine(idx, 'quantity', e.target.value)}
                              className="medical-input"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</label>
                          <select
                            value={med.frequency}
                            onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                            className="medical-input"
                          >
                            <option value="1">Once a day</option>
                            <option value="2">Twice a day</option>
                            <option value="3">Three times a day</option>
                            <option value="4">Four times a day</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Reminder Time{parseInt(med.frequency) > 1 ? 's' : ''}
                          </label>
                          <div className="space-y-2">
                            {med.reminderTimes.map((time, timeIdx) => (
                              <div key={timeIdx} className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-400 w-16">Dose {timeIdx + 1}</span>
                                <input
                                  type="time"
                                  value={time}
                                  onChange={(e) => updateReminderTime(idx, timeIdx, e.target.value)}
                                  className="medical-input flex-1"
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
                          <input
                            type="date"
                            value={med.startDate}
                            onChange={(e) => updateMedicine(idx, 'startDate', e.target.value)}
                            className="medical-input"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date</label>
                          <input
                            type="date"
                            value={med.endDate}
                            onChange={(e) => updateMedicine(idx, 'endDate', e.target.value)}
                            className="medical-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Special Instructions</label>
                        <textarea
                          placeholder="e.g. Take after food"
                          value={med.instructions}
                          onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                          className="medical-input min-h-[80px] py-3"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMedicineCard}
                  className="w-full py-3 border-2 border-dashed border-accent-200 text-accent-600 rounded-2xl font-bold hover:bg-accent-50 hover:border-accent-300 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Add Another Medicine
                </button>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button
                  onClick={handleAddMedicine}
                  disabled={loading}
                  className="flex-[2] btn-accent shadow-accent-lg py-3"
                >
                  {loading ? 'Processing...' : `Assign ${medicines.length} Medicine${medicines.length > 1 ? 's' : ''}`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMedicine(false)}
                  className="flex-1 btn-medical-outline py-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        showAddAppointment && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-slide-up">
              <div className="bg-amber-600 p-5 text-white">
                <h3 className="text-lg font-bold">Suggest Appointment</h3>
              </div>
              <form onSubmit={submitSuggestedAppointment} className="p-5 space-y-4">
                <select
                  value={appointmentForm.patientId || ''}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value ? parseInt(e.target.value) : 0 })}
                  className="medical-input"
                  required
                >
                  <option value="" disabled>Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mobileNumber})</option>
                  ))}
                </select>
                <input type="date" value={appointmentForm.proposedDate} onChange={(e) => setAppointmentForm({ ...appointmentForm, proposedDate: e.target.value })} className="medical-input" required min={new Date().toISOString().split('T')[0]} />
                <input type="time" value={appointmentForm.proposedTime} onChange={(e) => setAppointmentForm({ ...appointmentForm, proposedTime: e.target.value })} className="medical-input" required />
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium shadow-sm active:scale-95 transition-all">{loading ? 'Sending...' : 'Send Invite'}</button>
                  <button type="button" onClick={() => setShowAddAppointment(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* METRIC DRILL DOWN MODALS */}
      {showMetricModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up max-h-[80vh] flex flex-col">
            <div className={`p-6 text-white flex justify-between items-center ${showMetricModal === 'reminders' ? 'bg-amber-500' : showMetricModal === 'medicines' ? 'bg-accent-600' : 'bg-medical-600'
              }`}>
              <div>
                <h3 className="text-xl font-bold capitalize">
                  {showMetricModal === 'medicines' ? 'Active Medicines Details' : showMetricModal === 'reminders' ? 'Patients with Pending Reminders' : 'Total Patients List'}
                </h3>
                <p className="text-white/80 text-sm">
                  Quick summary of your current dashboard data
                </p>
              </div>
              <button onClick={() => setShowMetricModal(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {showMetricModal === 'patients' && (
                <div className="space-y-2">
                  {patients.length > 0 ? (
                    patients.map((p, idx) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-medical-200 transition-colors">
                        <span className="w-8 h-8 bg-medical-100 text-medical-700 rounded-full flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                        <span className="font-semibold text-gray-800">{p.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-10">No patients added yet.</p>
                  )}
                </div>
              )}

              {showMetricModal === 'medicines' && (
                <div className="space-y-4">
                  {patients.some(p => p.medicines.length > 0) ? (
                    patients.flatMap(p => p.medicines.map(m => (
                      <div key={m.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-medical-700">{m.name}</h4>
                          <span className="text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-bold">{m.dosage}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium text-gray-800">Patient:</span>
                          <span>{p.name}</span>
                        </div>
                        {p.disease && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span className="font-medium text-gray-800">Condition:</span>
                            <span className="text-accent-600 font-medium">{p.disease}</span>
                          </div>
                        )}
                      </div>
                    )))
                  ) : (
                    <p className="text-gray-500 text-center py-10">No active medicines assigned yet.</p>
                  )}
                </div>
              )}

              {showMetricModal === 'reminders' && (
                <div className="space-y-2">
                  {patients.filter(p => p.medicines.some(m => m.schedules.some(s => s.status === 'pending'))).length > 0 ? (
                    patients.filter(p => p.medicines.some(m => m.schedules.some(s => s.status === 'pending'))).map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800">{p.name}</span>
                            <p className="text-xs text-amber-600 font-medium">
                              {p.medicines.reduce((acc, m) => acc + m.schedules.filter(s => s.status === 'pending').length, 0)} pending alerts
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => {
                              setShowMetricModal(null)
                              router.push(`/patient/${p.id}`)
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-900 transition-colors"
                          >
                             View Profile →
                          </button>
                          
                          <div className="flex gap-2">
                            <button
                              disabled={queueActionLoading === p.id}
                              onClick={() => handleQueueAction(p.id, 'resend')}
                              className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-tight rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50 active:scale-95 shadow-sm shadow-amber-200"
                            >
                              {queueActionLoading === p.id ? '...' : 'Resend All'}
                            </button>
                            <button
                              disabled={queueActionLoading === p.id}
                              onClick={() => handleQueueAction(p.id, 'delete')}
                              className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-tight rounded-lg hover:bg-rose-50 transition-all disabled:opacity-50 active:scale-95"
                            >
                              {queueActionLoading === p.id ? '...' : 'Clear Queue'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No pending reminders at this time.</p>
                      <p className="text-xs text-gray-400 mt-1">All patients are up to date! ✅</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowMetricModal(null)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}