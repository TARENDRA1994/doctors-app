'use client'

import { useEffect, useState } from 'react'

export default function AppointmentConfirmationClient({ appointmentId }: { appointmentId: number }) {
    const [appointment, setAppointment] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [confirming, setConfirming] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        // Because we just need the details, we'll actually fetch it by creating a new generic GET endpoint for the appointment, 
        // or we can just display the confirmation UI immediately to keep it simple and robust. 
        // Let's assume the Magic Link implies they know what they are confirming (from their WhatsApp message).
        setLoading(false)
    }, [appointmentId])

    const handleConfirm = async () => {
        setConfirming(true)
        setMessage(null)
        try {
            const response = await fetch(`/api/appointments/${appointmentId}/confirm`, {
                method: 'POST'
            })
            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Appointment Confirmed Successfully!' })
                // Optimistically update
                setAppointment({ ...appointment, status: 'CONFIRMED' })
            } else {
                setMessage({ type: 'error', text: data.error || data.message || 'Failed to confirm.' })
            }
        } catch (error) {
            console.error('Confirm error:', error)
            setMessage({ type: 'error', text: 'An error occurred. Please try again later.' })
        } finally {
            setConfirming(false)
        }
    }

    const handleDecline = async () => {
        setConfirming(true)
        setMessage(null)
        try {
            const response = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'We have notified the doctor that you need another time.' })
                setAppointment({ ...appointment, status: 'RESCHEDULED' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to request reschedule.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again later.' })
        } finally {
            setConfirming(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-slide-up border border-gray-100">
                <div className="bg-gradient-to-r from-medical-500 to-medical-600 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold">Follow-Up Visit</h1>
                    <p className="text-medical-100 mt-1 text-sm">Your doctor has requested to see you.</p>
                </div>

                <div className="p-6">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
                            <div className="flex items-center gap-2 font-medium mb-1">
                                {message.type === 'success' ? '✅ Confirmed' : '⚠️ Notice'}
                            </div>
                            {message.text}
                        </div>
                    )}

                    {!message || message.type === 'error' ? (
                        <div className="space-y-4">
                            <p className="text-gray-600 text-center mb-6">
                                Please confirm your appointment slot that was sent to your WhatsApp.
                            </p>
                            <button
                                onClick={handleConfirm}
                                disabled={confirming}
                                className="w-full py-3.5 bg-gradient-to-r from-medical-500 to-medical-600 text-white rounded-xl font-bold text-lg shadow-medical hover:shadow-medical-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
                            >
                                {confirming ? 'Confirming...' : 'Yes, I Confirm'}
                            </button>
                            <button
                                onClick={handleDecline}
                                disabled={confirming}
                                className="w-full py-3 bg-white text-gray-500 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                I can't make it
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-600 mb-6">Your doctor has been automatically notified. We look forward to seeing you!</p>
                            <button
                                onClick={() => window.close()}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Close Window
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
