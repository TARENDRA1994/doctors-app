'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function FeedbackPage() {
    const params = useParams()
    const router = useRouter()
    const medicineId = params.medicineId as string

    const [medicineName, setMedicineName] = useState('your medicine')
    const [patientName, setPatientName] = useState('Patient')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [step, setStep] = useState<'selection' | 'no_improvement_form' | 'success'>('selection')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        // Fetch medicine and patient details to personalize the form
        const fetchDetails = async () => {
            try {
                const response = await fetch(`/api/feedback/info?medicineId=${medicineId}`)
                if (response.ok) {
                    const data = await response.json()
                    setMedicineName(data.medicineName)
                    setPatientName(data.patientName)
                }
            } catch (error) {
                console.error('Failed to fetch details', error)
            } finally {
                setLoading(false)
            }
        }

        if (medicineId) {
            fetchDetails()
        }
    }, [medicineId])

    const submitFeedback = async (status: 'feeling_ok' | 'no_improvement', additionalNotes: string = '') => {
        setSubmitting(true)
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    medicineId: parseInt(medicineId),
                    status,
                    notes: additionalNotes
                })
            })

            if (response.ok) {
                setStep('success')
            } else {
                alert('Failed to submit feedback. Please try again.')
            }
        } catch (error) {
            console.error('Error submitting feedback', error)
            alert('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleFeelingOk = () => {
        submitFeedback('feeling_ok')
    }

    const handleNoImprovement = () => {
        setStep('no_improvement_form')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-medical-50 flex items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-medical-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="bg-gradient-to-r from-medical-500 to-medical-600 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Treatment Complete</h2>
                    <p className="text-medical-100 mt-1">DoctorsNode Feedback</p>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                    {step === 'selection' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Hello, {patientName}</h3>
                                <p className="text-gray-600">
                                    You have completed your course of <strong>{medicineName}</strong>.
                                    How are you feeling now?
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleFeelingOk}
                                    disabled={submitting}
                                    className="w-full relative overflow-hidden group bg-white border-2 border-accent-500 rounded-xl p-4 flex items-center justify-center gap-3 transition-all hover:bg-accent-50 focus:outline-none focus:ring-4 focus:ring-accent-100 disabled:opacity-50"
                                >
                                    <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="text-2xl">😊</span>
                                    </div>
                                    <span className="text-lg font-semibold text-accent-700">Feeling Ok</span>
                                </button>

                                <button
                                    onClick={handleNoImprovement}
                                    disabled={submitting}
                                    className="w-full relative overflow-hidden group bg-white border-2 border-amber-500 rounded-xl p-4 flex items-center justify-center gap-3 transition-all hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:opacity-50"
                                >
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="text-2xl">😕</span>
                                    </div>
                                    <span className="text-lg font-semibold text-amber-700">No Improvement</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'no_improvement_form' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-amber-800">Doctor's Recommendation</h3>
                                        <div className="mt-2 text-sm text-amber-700">
                                            <p>Since you haven't seen improvement, we strongly recommend scheduling another appointment. You may need further tests, such as blood or urine tests, to better understand your condition.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Describe your symptoms (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 text-sm p-3 border"
                                        placeholder="I am still experiencing..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep('selection')}
                                        className="flex-1 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => submitFeedback('no_improvement', notes)}
                                        disabled={submitting}
                                        className="flex-[2] px-4 py-3 bg-amber-500 text-white rounded-xl font-medium shadow-sm hover:bg-amber-600 focus:ring-4 focus:ring-amber-200 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Alert Doctor'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center animate-fade-in py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                            <p className="text-gray-600">
                                Your feedback has been successfully sent to your doctor. They will review it shortly.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
