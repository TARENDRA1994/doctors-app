'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Doctor {
  id: number
  name: string
  clinicName: string
}

export default function BookTokenClient({ doctors }: { doctors: Doctor[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    doctorId: '',
    patientName: '',
    patientPhone: '',
    dateStr: new Date().toISOString().split('T')[0] // today's date in YYYY-MM-DD
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(null)

    try {
      const res = await fetch('/api/queue/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to book token')
      }

      setSuccess(data.token)
      // Reset form but keep phone so they can easily check status
      setFormData({
        ...formData,
        patientName: '',
        dateStr: new Date().toISOString().split('T')[0]
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
           </svg>
        </div>
        <h3 className="text-2xl font-black text-green-800 mb-2">Appointment Confirmed!</h3>
        <p className="text-green-700 font-medium mb-6">Your queue number is:</p>
        <div className="text-6xl font-black text-green-600 mb-6 drop-shadow-sm">#{success.tokenNumber}</div>
        <p className="text-sm text-green-600/80 mb-6">Status: <span className="uppercase font-bold tracking-widest">{success.status}</span></p>
        
        <div className="flex flex-col gap-3">
            <Link 
              href={`/status?phone=${success.patientPhone}`}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
            >
              Check Live Status
            </Link>
            <button 
              onClick={() => setSuccess(null)}
              className="w-full py-3 bg-transparent text-green-700 font-bold hover:bg-green-100 rounded-xl transition-colors"
            >
              Book Another
            </button>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="doctorId" className="block text-sm font-bold text-slate-700 mb-1">
            Select Clinic / Doctor
          </label>
          <select
            id="doctorId"
            name="doctorId"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors"
            value={formData.doctorId}
            onChange={handleChange}
          >
            <option value="">-- Choose a Doctor --</option>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.clinicName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="patientName" className="block text-sm font-bold text-slate-700 mb-1">
            Patient Name
          </label>
          <input
            id="patientName"
            name="patientName"
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="patientPhone" className="block text-sm font-bold text-slate-700 mb-1">
            Phone Number
          </label>
          <input
            id="patientPhone"
            name="patientPhone"
            type="tel"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors"
            value={formData.patientPhone}
            onChange={handleChange}
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label htmlFor="dateStr" className="block text-sm font-bold text-slate-700 mb-1">
            Date
          </label>
          <input
            id="dateStr"
            name="dateStr"
            type="date"
            required
            min={today}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors"
            value={formData.dateStr}
            onChange={handleChange}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  )
}
