'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Activity, Heart, Scale, Trash2, Plus, Calendar, AlertCircle, Download } from 'lucide-react'

interface Vital {
    id: number
    type: string
    value: string
    unit: string
    timestamp: string
}

interface LabReport {
    id: number
    fileName: string
    aiSummary: string | null
    createdAt: string
}

interface Medicine {
    id: number
    name: string
    dosage: string
    frequency: number
    reminderTime: string
    startDate: string
    endDate: string
    instructions: string | null
    feedback?: {
        status: 'feeling_ok' | 'no_improvement'
        notes: string | null
        createdAt: string
    } | null
}

interface PatientHistory {
    id: number
    name: string
    mobileNumber: string
    guardianNumber: string | null
    age: number | null
    disease: string | null
    preferredLanguage: string
    createdAt: string
    isChronic: boolean
    gender: string | null
    medicines: Medicine[]
    labReports: LabReport[]
    vitals: Vital[]
}

export default function PatientHistoryPage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [patient, setPatient] = useState<PatientHistory | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'prescriptions' | 'diet' | 'lab' | 'vitals'>('prescriptions')
    const [vitals, setVitals] = useState<Vital[]>([])
    const [loadingVitals, setLoadingVitals] = useState(false)
    const [addingVital, setAddingVital] = useState(false)
    const [vitalType, setVitalType] = useState('Blood Sugar')
    const [vitalValue, setVitalValue] = useState('')
    const [vitalUnit, setVitalUnit] = useState('mg/dL')
    const [updatingChronic, setUpdatingChronic] = useState(false)
    const [dietPlans, setDietPlans] = useState<any[]>([])
    const [loadingDietPlans, setLoadingDietPlans] = useState(false)
    const [generatingPlan, setGeneratingPlan] = useState(false)
    const [sharingPlanId, setSharingPlanId] = useState<number | null>(null)
    const [uploadingReport, setUploadingReport] = useState(false)
    const [updatingLanguage, setUpdatingLanguage] = useState(false)
    const [trendSummary, setTrendSummary] = useState<string | null>(null)
    const [loadingTrend, setLoadingTrend] = useState(false)
    const [sharingTrend, setSharingTrend] = useState(false)
    const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
    const [showEditMedicine, setShowEditMedicine] = useState(false)
    const [updatingMedicine, setUpdatingMedicine] = useState(false)
    const [showAddMedicine, setShowAddMedicine] = useState(false)
    const [addingMedicine, setAddingMedicine] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deletingPatient, setDeletingPatient] = useState(false)
    const [sharingPrescriptionPortal, setSharingPrescriptionPortal] = useState(false)
    const [modalVitals, setModalVitals] = useState({
        weight: '',
        height: '',
        bp: '',
        sugar: ''
    })
    const [sharingPrescription, setSharingPrescription] = useState(false)

    // Multi-medicine assignment state
    const getDefaultTimes = (freq: number): string[] => {
        switch (freq) {
            case 1: return ['08:00']
            case 2: return ['08:00', '20:00']
            case 3: return ['08:00', '14:00', '20:00']
            case 4: return ['06:00', '12:00', '18:00', '22:00']
            default: return ['08:00']
        }
    }

    const emptyMedicine = () => ({
        name: '',
        dosage: '',
        quantity: '1',
        frequency: '1',
        reminderTimes: ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        instructions: '',
    })

    const [medicines, setMedicines] = useState([emptyMedicine()])

    const addMedicineCard = () => {
        setMedicines([...medicines, emptyMedicine()])
    }

    const removeMedicineCard = (index: number) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index))
        }
    }

    const updateNewMedicine = (index: number, field: string, value: any) => {
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

    const updateNewMedicineReminderTime = (medIndex: number, timeIndex: number, value: string) => {
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
        if (session && params.id) {
            fetchPatientHistory()
            fetchDietPlans()
        }
    }, [session, params.id])

    const fetchPatientHistory = async () => {
        try {
            const response = await fetch(`/api/patients/${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setPatient(data)
            }
        } catch (error) {
            console.error('Error fetching patient history:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchDietPlans = async () => {
        setLoadingDietPlans(true)
        try {
            const response = await fetch(`/api/diet-plan?patientId=${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setDietPlans(data)
            }
        } catch (error) {
            console.error('Error fetching diet plans:', error)
        } finally {
            setLoadingDietPlans(false)
        }
    }

    const handleGenerateDietPlan = async () => {
        setGeneratingPlan(true)
        try {
            const response = await fetch('/api/diet-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: parseInt(params.id) })
            })
            if (response.ok) {
                await fetchDietPlans()
                setActiveTab('diet')
            } else {
                const errorData = await response.json()
                alert(`Failed to generate diet plan: ${errorData.error || 'Please try again.'}`)
            }
        } catch (error) {
            console.error('Error generating diet plan:', error)
            alert('An error occurred while generating.')
        } finally {
            setGeneratingPlan(false)
        }
    }

    const handleShareDietPlan = async (dietPlanId: number) => {
        setSharingPlanId(dietPlanId)
        try {
            const response = await fetch('/api/diet-plan/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dietPlanId, patientId: parseInt(params.id) })
            })
            if (response.ok) {
                alert('Diet plan shared successfully via WhatsApp!')
            } else {
                alert('Failed to share diet plan. Please check the Meta configuration.')
            }
        } catch (error) {
            console.error('Error sharing diet plan:', error)
            alert('An error occurred while sharing.')
        } finally {
            setSharingPlanId(null)
        }
    }

    const handleLanguageChange = async (newLang: string) => {
        setUpdatingLanguage(true)
        try {
            const response = await fetch(`/api/patients/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferredLanguage: newLang })
            })
            if (response.ok) {
                setPatient(prev => prev ? { ...prev, preferredLanguage: newLang } : null)
            }
        } catch (error) {
            console.error('Error updating language:', error)
        } finally {
            setUpdatingLanguage(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingReport(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('patientId', params.id)

        try {
            const response = await fetch('/api/lab-reports/upload', {
                method: 'POST',
                body: formData
            })
            if (response.ok) {
                await fetchPatientHistory() // Refresh to show new report
                setActiveTab('lab')
            } else {
                alert('Failed to upload and analyze report.')
            }
        } catch (error) {
            console.error('Error uploading report:', error)
            alert('An error occurred during upload.')
        } finally {
            setUploadingReport(false)
            // Reset input
            e.target.value = ''
        }
    }

    const handleChronicToggle = async () => {
        setUpdatingChronic(true)
        const newValue = !patient?.isChronic
        try {
            const response = await fetch(`/api/patients/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isChronic: newValue })
            })
            if (response.ok) {
                setPatient(prev => prev ? { ...prev, isChronic: newValue } : null)
            }
        } catch (error) {
            console.error('Error updating chronic status:', error)
        } finally {
            setUpdatingChronic(false)
        }
    }

    const handleAddVital = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!vitalValue) return

        setAddingVital(true)
        try {
            const response = await fetch('/api/vitals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: params.id,
                    type: vitalType,
                    value: vitalValue,
                    unit: vitalUnit
                })
            })
            if (response.ok) {
                const newVital = await response.json()
                setPatient(prev => prev ? { ...prev, vitals: [...prev.vitals, newVital] } : null)
                setVitalValue('')
            }
        } catch (error) {
            console.error('Error adding vital:', error)
        } finally {
            setAddingVital(false)
        }
    }

    const handleGenerateTrend = async () => {
        setLoadingTrend(true)
        try {
            const response = await fetch('/api/vitals/trend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: params.id })
            })
            if (response.ok) {
                const data = await response.json()
                setTrendSummary(data.summary)
            }
        } catch (error) {
            console.error('Error generating trend analysis:', error)
        } finally {
            setLoadingTrend(false)
        }
    }

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddingMedicine(true)
        try {
            // Save Vitals if provided
            const vitalsToSave = [
                { type: 'Weight', value: modalVitals.weight, unit: 'kg' },
                { type: 'Height', value: modalVitals.height, unit: 'cm' },
                { type: 'BP', value: modalVitals.bp, unit: 'mmHg' },
                { type: 'Blood Sugar', value: modalVitals.sugar, unit: 'mg/dL' }
            ].filter(v => v.value.trim() !== '')

            for (const v of vitalsToSave) {
                await fetch('/api/vitals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        patientId: params.id,
                        type: v.type,
                        value: v.value,
                        unit: v.unit
                    })
                })
            }

            let allSuccess = true
            for (const med of medicines) {
                if (!med.name || !med.dosage || !med.startDate || !med.endDate) {
                    alert('Please fill in all required fields for each medicine')
                    setAddingMedicine(false)
                    return
                }

                const finalReminderTime = med.reminderTimes.join(',')
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
                        patientId: parseInt(params.id),
                        startDate: med.startDate,
                        endDate: med.endDate,
                        instructions: med.instructions,
                    })
                })

                if (!response.ok) {
                    allSuccess = false
                    const error = await response.json()
                    alert(error.error || `Failed to add ${med.name}`)
                    break
                }
            }

            if (allSuccess) {
                alert(`${medicines.length} medicine(s) assigned successfully!`)
                setShowAddMedicine(false)
                setMedicines([emptyMedicine()])
                setModalVitals({ weight: '', height: '', bp: '', sugar: '' })
                fetchPatientHistory()
            }
        } catch (error) {
            console.error('Error assigning medicine:', error)
            alert('An error occurred while assigning medicine')
        } finally {
            setAddingMedicine(false)
        }
    }

    const handleUpdateMedicine = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingMedicine) return

        setUpdatingMedicine(true)
        try {
            const response = await fetch(`/api/medicines/${editingMedicine.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingMedicine)
            })
            if (response.ok) {
                alert('Medicine updated and notification sent!')
                setShowEditMedicine(false)
                fetchPatientHistory()
            } else {
                alert('Failed to update medicine.')
            }
        } catch (error) {
            console.error('Error updating medicine:', error)
        } finally {
            setUpdatingMedicine(false)
        }
    }

    const handleDeleteMedicine = async (id: number) => {
        if (!confirm('Are you sure you want to delete this medicine? This will stop all future reminders.')) return
        try {
            const response = await fetch(`/api/medicines/${id}`, { method: 'DELETE' })
            if (response.ok) {
                fetchPatientHistory()
            }
        } catch (error) {
            console.error('Error deleting medicine:', error)
        }
    }

    const handlePermanentDelete = async () => {
        setDeletingPatient(true)
        try {
            const response = await fetch(`/api/patients/${params.id}?hard=true`, {
                method: 'DELETE'
            })
            if (response.ok) {
                alert('Patient record deleted permanently.')
                router.push('/dashboard')
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to delete patient')
            }
        } catch (error) {
            console.error('Error deleting patient:', error)
            alert('An error occurred while deleting patient')
        } finally {
            setDeletingPatient(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleShareTrend = async () => {
        if (!trendSummary) return
        setSharingTrend(true)
        try {
            const response = await fetch('/api/vitals/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: params.id,
                    trendSummary
                })
            })
            if (response.ok) {
                alert('Health progress report shared successfully via WhatsApp!')
            } else {
                alert('Failed to share report. Please check the WhatsApp configuration.')
            }
        } catch (error) {
            console.error('Error sharing trend analysis:', error)
            alert('An error occurred while sharing.')
        } finally {
            setSharingTrend(false)
        }
    }

    const handleSharePrescription = async () => {
        setSharingPrescription(true)
        try {
            const response = await fetch('/api/prescriptions/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: parseInt(params.id) })
            })
            if (response.ok) {
                alert('Prescription PDF sent successfully via WhatsApp!')
            } else {
                const error = await response.json()
                alert(`Failed to send prescription: ${error.error || 'Please check WhatsApp configuration.'}`)
            }
        } catch (error) {
            console.error('Error sharing prescription:', error)
            alert('An error occurred while sharing current prescription.')
        } finally {
            setSharingPrescription(false)
        }
    }

    const handleSharePrescriptionToPortal = async () => {
        setSharingPrescriptionPortal(true)
        try {
            const response = await fetch(`/api/patients/${params.id}/share-prescription`, {
                method: 'POST',
            })
            if (response.ok) {
                const data = await response.json()
                setPatient(prev => prev ? { ...prev, prescriptionSharedAt: data.prescriptionSharedAt } : null)
                alert('Prescription is now live and updated in the Patient Portal!')
            } else {
                alert('Failed to share prescription to portal.')
            }
        } catch (error) {
            console.error('Error sharing prescription to portal:', error)
        } finally {
            setSharingPrescriptionPortal(false)
        }
    }

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-accent-50 flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading patient history...</p>
                </div>
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
                <p className="text-gray-500 mb-6">We couldn't locate this patient's records.</p>
                <button onClick={() => router.push('/dashboard')} className="btn-medical">
                    Return to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-medical-50/20 to-accent-50/20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-medical-100 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="p-2 text-gray-400 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Patient History</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Patient Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-medical-100 overflow-hidden mb-8 animate-slide-up">
                    <div className="bg-gradient-to-r from-medical-500 to-medical-600 p-6 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                        <div className="relative z-10 flex gap-6 items-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-inner">
                                {patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold">{patient.name}</h2>
                                    {((patient as any).status === 'INACTIVE' || (patient as any).isActive === false) && (
                                        <span className="bg-red-500/30 text-white text-xs px-2.5 py-1 rounded-full border border-red-400/30 font-bold tracking-wider animate-pulse">INACTIVE</span>
                                    )}
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                        title="Delete Patient Permanently"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-100" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <p className="text-medical-100 flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        {patient.mobileNumber}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full border border-white/20">
                                        <span className="text-medical-100 italic">Language:</span>
                                        <select
                                            value={patient.preferredLanguage}
                                            onChange={(e) => handleLanguageChange(e.target.value)}
                                            disabled={updatingLanguage}
                                            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                                        >
                                            <option value="English" className="text-gray-900">English</option>
                                            <option value="Hindi" className="text-gray-900">Hindi</option>
                                            <option value="Marathi" className="text-gray-900">Marathi</option>
                                            <option value="Gujarati" className="text-gray-900">Gujarati</option>
                                            <option value="Tamil" className="text-gray-900">Tamil</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleChronicToggle}
                                        disabled={updatingChronic}
                                        className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full border transition-all ${patient.isChronic
                                            ? 'bg-red-500/20 border-red-400/50 text-white'
                                            : 'bg-white/10 border-white/20 text-medical-100 hover:bg-white/20'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${patient.isChronic ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                        {patient.isChronic ? 'Chronic Care Active' : 'Enable Chronic Care'}
                                    </button>
                                </div>
                                {patient.guardianNumber && (
                                    <p className="text-medical-200/80 text-sm flex items-center gap-2 mt-2">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        Guardian: {patient.guardianNumber}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Age</p>
                            <p className="font-semibold text-gray-800">{patient.age || 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Latest Condition</p>
                            <p className="font-semibold text-gray-800">{patient.disease || 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Prescriptions</p>
                            <p className="font-semibold text-gray-800">{patient.medicines.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Registered Since</p>
                            <p className="font-semibold text-gray-800">{new Date(patient.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('prescriptions')}
                        className={`pb-2 px-1 font-semibold transition-colors duration-200 ${activeTab === 'prescriptions'
                            ? 'text-medical-600 border-b-2 border-medical-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Prescriptions
                    </button>
                    <button
                        onClick={() => setActiveTab('lab')}
                        className={`pb-2 px-1 font-semibold transition-colors duration-200 flex items-center gap-2 ${activeTab === 'lab'
                            ? 'text-medical-600 border-b-2 border-medical-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Lab Reports
                        <span className="bg-accent-100 text-accent-700 text-xs px-2 py-0.5 rounded-full">AI Analysis</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('vitals')}
                        className={`pb-2 px-1 font-semibold transition-colors duration-200 flex items-center gap-2 ${activeTab === 'vitals'
                            ? 'text-medical-600 border-b-2 border-medical-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Vitals Tracking
                        {patient.isChronic && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full animate-pulse">Chronic</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('diet')}
                        className={`pb-2 px-1 font-semibold transition-colors duration-200 flex items-center gap-2 ${activeTab === 'diet'
                            ? 'text-medical-600 border-b-2 border-medical-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        AI Diet Plans
                        <span className="bg-medical-100 text-medical-700 text-xs px-2 py-0.5 rounded-full">AI</span>
                    </button>
                </div>

                {activeTab === 'prescriptions' && (
                    <>
                        {/* Prescription & Feedback Timeline */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                                </svg>
                                Prescription History
                            </h3>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowAddMedicine(true)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-medical-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    Assign medicine
                                </button>
                                <button
                                    onClick={handleSharePrescriptionToPortal}
                                    disabled={sharingPrescriptionPortal}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-white text-medical-600 border border-medical-200 font-bold rounded-xl hover:bg-medical-50 transition-all flex items-center justify-center gap-2 text-sm"
                                    title="Share live prescription to the patient portal"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    {sharingPrescriptionPortal ? 'Sharing...' : 'Share to Portal'}
                                </button>
                                <button
                                    onClick={() => {
                                        window.open(`/api/prescriptions/pdf?patientId=${patient.id}`, '_blank')
                                    }}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-white text-medical-600 border border-medical-200 font-bold rounded-xl hover:bg-medical-50 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={handleSharePrescription}
                                    disabled={sharingPrescription}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-accent-600 text-white font-bold rounded-xl hover:bg-accent-700 transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-accent-100 disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.4-16.4-14.7-27.5-32.8-30.7-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.8-5.6 5.5-9.3 1.9-3.7.9-6.5-.5-9.3-1.4-2.8-12.5-30.1-17.1-41.3-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                                    </svg>
                                    {sharingPrescription ? 'Sending...' : 'Send WhatsApp'}
                                </button>
                            </div>
                        </div>

                        {(patient as any).prescriptionSharedAt && (
                           <div className="mb-4 bg-blue-50 text-blue-800 text-xs px-4 py-2 rounded-lg border border-blue-100 flex items-center justify-between">
                             <span>Prescription is active on the Patient Portal.</span>
                             <span className="font-bold">Shared: {new Date((patient as any).prescriptionSharedAt).toLocaleDateString()}</span>
                           </div>
                        )}

                        {patient.medicines.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
                                <p className="text-gray-500">No medicines have been prescribed yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {patient.medicines.map((med) => {
                                    const isActive = new Date(med.endDate) >= new Date()

                                    return (
                                        <div key={med.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                                        {med.name}
                                                        {isActive ? (
                                                            <span className="medical-badge bg-green-100 text-green-700 text-xs py-0.5">Active</span>
                                                        ) : (
                                                            <span className="medical-badge bg-gray-100 text-gray-600 text-xs py-0.5">Completed</span>
                                                        )}
                                                    </h4>
                                                    <p className="text-gray-600 mt-1">{med.dosage}</p>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="text-right text-sm text-gray-500">
                                                        <p>{new Date(med.startDate).toLocaleDateString()} &rarr; {new Date(med.endDate).toLocaleDateString()}</p>
                                                        <p className="mt-1 font-medium text-gray-700">{med.frequency}x/day • {med.reminderTime}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingMedicine(med)
                                                                setShowEditMedicine(true)
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-all"
                                                            title="Edit Medicine"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMedicine(med.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete Medicine"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {med.instructions && (
                                                <div className="text-sm bg-gray-50 p-3 rounded-lg text-gray-600 mb-4">
                                                    <span className="font-medium text-gray-700 mr-1">Instructions:</span>
                                                    {med.instructions}
                                                </div>
                                            )}

                                            {/* Feedback Section */}
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                {med.feedback ? (
                                                    <div className={`flex items-start gap-3 p-3 rounded-lg ${med.feedback.status === 'no_improvement'
                                                        ? 'bg-amber-50 border border-amber-100 text-amber-900'
                                                        : 'bg-green-50 border border-green-100 text-green-900'
                                                        }`}>
                                                        <span className="text-2xl mt-0.5">
                                                            {med.feedback.status === 'no_improvement' ? '😕' : '😊'}
                                                        </span>
                                                        <div>
                                                            <p className="font-semibold text-sm">
                                                                {med.feedback.status === 'no_improvement' ? 'Reported No Improvement' : 'Reported Feeling OK'}
                                                            </p>
                                                            {med.feedback.notes && (
                                                                <p className="text-sm mt-1 opacity-90 italic">"{med.feedback.notes}"</p>
                                                            )}
                                                            <div className="flex items-center justify-between mt-3">
                                                                <p className="text-xs opacity-60">
                                                                    Submitted {new Date(med.feedback.createdAt).toLocaleDateString()}
                                                                </p>
                                                                {med.feedback.status === 'no_improvement' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            // We need handleSuggestAppointment here too if we want it to work
                                                                            // For now, let's at least show the intent or redirect to dashboard with state
                                                                            router.push('/dashboard')
                                                                        }}
                                                                        className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full hover:bg-amber-300 transition-colors"
                                                                    >
                                                                        Suggest Follow-up
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No feedback submitted for this prescription course yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'lab' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                🔬 Lab Reports & AI Analysis
                            </h3>
                            <label className="cursor-pointer group">
                                <span className={`px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-all ${uploadingReport ? 'bg-gray-100 text-gray-400' : 'bg-medical-50 text-medical-700 border border-medical-200 group-hover:bg-medical-100 shadow-sm hover:shadow-md'}`}>
                                    {uploadingReport ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-medical-600 border-t-transparent rounded-full animate-spin"></div>
                                            Analyzing Report...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            Upload New Report
                                        </>
                                    )}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileUpload}
                                    disabled={uploadingReport}
                                />
                            </label>
                        </div>

                        {patient.labReports && patient.labReports.length === 0 ? (
                            <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-medical-100 text-center">
                                <div className="w-16 h-16 bg-medical-50 rounded-full flex items-center justify-center text-medical-600 mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <h4 className="text-gray-800 font-bold text-lg mb-1">No reports uploaded</h4>
                                <p className="text-gray-500 max-w-sm mx-auto">Upload blood tests or clinical reports to get an automated AI summary of key findings.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {patient.labReports?.map((report) => (
                                    <div key={report.id} className="bg-white rounded-xl border border-medical-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                        <div className="bg-gray-50/50 px-5 py-3 border-b border-medical-100 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg border border-medical-100 text-medical-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm truncate max-w-[200px]">{report.fileName}</p>
                                                    <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] uppercase tracking-wider font-bold bg-accent-100 text-accent-700 px-2 py-0.5 rounded">AI Summarized</span>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <div className="bg-medical-50/30 rounded-lg p-4 border border-medical-100/50">
                                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line italic">
                                                            {report.aiSummary || 'Analysis in progress...'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'vitals' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Entry Form */}
                            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-medical-100 shadow-sm h-fit">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <Plus className="w-4 h-4 text-medical-600" />
                                    Record Vitals
                                </h3>
                                <form onSubmit={handleAddVital} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Metric Type</label>
                                        <select
                                            value={vitalType}
                                            onChange={(e) => {
                                                setVitalType(e.target.value)
                                                if (e.target.value === 'Blood Sugar') setVitalUnit('mg/dL')
                                                if (e.target.value === 'BP') setVitalUnit('mmHg')
                                                if (e.target.value === 'Weight') setVitalUnit('kg')
                                            }}
                                            className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-medical-500"
                                        >
                                            <option>Blood Sugar</option>
                                            <option>BP</option>
                                            <option>Weight</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Value ({vitalUnit})</label>
                                        <input
                                            type="text"
                                            value={vitalValue}
                                            onChange={(e) => setVitalValue(e.target.value)}
                                            placeholder="e.g. 120"
                                            className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-medical-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={addingVital}
                                        className="w-full bg-medical-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-medical-700 transition-colors disabled:opacity-50"
                                    >
                                        {addingVital ? 'Saving...' : 'Add Record'}
                                    </button>
                                </form>
                            </div>

                            {/* Trend Charts */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-medical-100 shadow-sm">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
                                        <Activity className="w-4 h-4 text-medical-600" />
                                        Health Trends
                                    </h3>

                                    {patient.vitals.filter(v => v.type === vitalType).length < 2 ? (
                                        <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                                            <p className="text-sm">Need at least 2 records to show trends</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-48 mb-6">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={patient.vitals.filter(v => v.type === vitalType)}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                        <XAxis
                                                            dataKey="timestamp"
                                                            tickFormatter={(str: string) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            fontSize={10}
                                                            tick={{ fill: '#9ca3af' }}
                                                        />
                                                        <YAxis fontSize={10} tick={{ fill: '#9ca3af' }} />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                            labelFormatter={(label: any) => new Date(label).toLocaleString()}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#14b8a6"
                                                            strokeWidth={3}
                                                            dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* AI Trend Summary Section */}
                                            <div className="mt-6 border-t border-gray-100 pt-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-accent-500" />
                                                        AI Trend Analysis
                                                    </h4>
                                                    {!trendSummary && (
                                                        <button
                                                            onClick={handleGenerateTrend}
                                                            disabled={loadingTrend}
                                                            className="text-xs font-bold text-medical-600 bg-medical-50 px-3 py-1 rounded-full hover:bg-medical-100 transition-colors disabled:opacity-50"
                                                        >
                                                            {loadingTrend ? 'Analyzing...' : 'Generate AI Summary'}
                                                        </button>
                                                    )}
                                                </div>

                                                {trendSummary ? (
                                                    <div className="bg-gradient-to-br from-medical-50/50 to-accent-50/50 p-4 rounded-xl border border-medical-100/50">
                                                        <p className="text-sm text-gray-700 leading-relaxed italic">
                                                            "{trendSummary}"
                                                        </p>
                                                        <div className="flex items-center justify-between mt-3">
                                                            <button
                                                                onClick={() => setTrendSummary(null)}
                                                                className="text-[10px] text-gray-400 hover:text-gray-600 underline"
                                                            >
                                                                Refresh Analysis
                                                            </button>
                                                            <button
                                                                onClick={handleShareTrend}
                                                                disabled={sharingTrend}
                                                                className="text-xs font-bold text-white bg-medical-500 hover:bg-medical-600 px-3 py-1 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                                                            >
                                                                {sharingTrend ? (
                                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                                )}
                                                                Share with Patient
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : !loadingTrend && (
                                                    <p className="text-xs text-gray-400 italic">Click generate to get an AI-powered summary of these trends.</p>
                                                )}

                                                {loadingTrend && (
                                                    <div className="animate-pulse flex space-x-4">
                                                        <div className="flex-1 space-y-2 py-1">
                                                            <div className="h-2 bg-gray-100 rounded"></div>
                                                            <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                                                            <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Logs */}
                                <div className="bg-white rounded-2xl border border-medical-100 shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-3 border-b border-medical-100 flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Logs</h4>
                                    </div>
                                    <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                        {patient.vitals.filter(v => v.type === vitalType).slice().reverse().map((vital) => (
                                            <div key={vital.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${vital.type === 'Blood Sugar' ? 'bg-amber-50 text-amber-600' :
                                                        vital.type === 'BP' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {vital.type === 'Blood Sugar' ? <Activity className="w-4 h-4" /> :
                                                            vital.type === 'BP' ? <Heart className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{vital.type}</p>
                                                        <p className="text-[10px] text-gray-500">{new Date(vital.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900">{vital.value} <span className="text-[10px] font-normal text-gray-500">{vital.unit}</span></p>
                                                </div>
                                            </div>
                                        ))}
                                        {patient.vitals.length === 0 && (
                                            <p className="p-6 text-center text-gray-400 text-sm italic">No vitals recorded yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'diet' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                🥗 Personalized AI Diet Plans
                            </h3>
                            <button
                                onClick={handleGenerateDietPlan}
                                disabled={generatingPlan}
                                className="px-4 py-2 bg-gradient-to-r from-medical-600 to-medical-500 text-white font-medium rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-2"
                            >
                                {generatingPlan ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating Plan...
                                    </>
                                ) : (
                                    <>
                                        <span>✨</span> Generate New Plan
                                    </>
                                )}
                            </button>
                        </div>

                        {loadingDietPlans ? (
                            <div className="p-8 text-center text-gray-500">Loading diet plans...</div>
                        ) : dietPlans.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
                                <p className="text-gray-500 mb-2">No diet plans generated for this patient yet.</p>
                                <p className="text-sm text-gray-400">Click the button above to generate one based on their condition and medications.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {dietPlans.map((plan) => (
                                    <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-gray-50 to-medical-50/30 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-800">Dietary Recommendations</h4>
                                                <p className="text-sm text-gray-500">Generated {new Date(plan.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleShareDietPlan(plan.id)}
                                                disabled={sharingPlanId === plan.id}
                                                className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-50"
                                            >
                                                {sharingPlanId === plan.id ? 'Sending...' : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.027 6.988 2.895a9.86 9.86 0 012.893 6.994c-.003 5.378-4.35 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                        Share via WhatsApp
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <div className="prose prose-sm md:prose max-w-none text-gray-700 whitespace-pre-line">
                                                {/* In a real app we'd use React Markdown here, but plain text with lines works for Gemini output */}
                                                {plan.planContent.split('\n').map((line: string, i: number) => {
                                                    if (line.startsWith('## ')) return <h3 key={i} className="text-xl font-bold mt-4 mb-2 text-medical-800">{line.replace('## ', '')}</h3>
                                                    if (line.startsWith('# ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-medical-900">{line.replace('# ', '')}</h2>
                                                    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>
                                                    if (line.trim().startsWith('* ')) return <li key={i} className="ml-4 mb-1 list-disc font-normal" dangerouslySetInnerHTML={{ __html: line.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                                    if (line.trim() === '') return <br key={i} />
                                                    return <p key={i} className="my-1 font-normal" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* Add New Medicine Modal */}
                {showAddMedicine && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-gray-900">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-up flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-medical-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Assign New Medicine</h3>
                                    <p className="text-sm text-gray-500">Prescribe one or more medications</p>
                                </div>
                                <button onClick={() => setShowAddMedicine(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <form onSubmit={handleAddMedicine} className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Optional Vitals Section */}
                                <div className="p-6 bg-medical-50/30 rounded-2xl border border-medical-100/50">
                                    <h4 className="text-sm font-bold text-medical-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Current Vitals (Optional)
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Weight (kg)</label>
                                            <input
                                                type="text"
                                                value={modalVitals.weight}
                                                onChange={(e) => setModalVitals({ ...modalVitals, weight: e.target.value })}
                                                placeholder="e.g. 70"
                                                className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Height (cm)</label>
                                            <input
                                                type="text"
                                                value={modalVitals.height}
                                                onChange={(e) => setModalVitals({ ...modalVitals, height: e.target.value })}
                                                placeholder="e.g. 175"
                                                className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">BP (mmHg)</label>
                                            <input
                                                type="text"
                                                value={modalVitals.bp}
                                                onChange={(e) => setModalVitals({ ...modalVitals, bp: e.target.value })}
                                                placeholder="e.g. 120/80"
                                                className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Sugar (mg/dL)</label>
                                            <input
                                                type="text"
                                                value={modalVitals.sugar}
                                                onChange={(e) => setModalVitals({ ...modalVitals, sugar: e.target.value })}
                                                placeholder="e.g. 110"
                                                className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {medicines.map((med, idx) => (
                                        <div key={idx} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 relative group hover:border-medical-200 transition-all">
                                            {medicines.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedicineCard(idx)}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors z-10 border border-red-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-medical-600 uppercase tracking-wider">Medicine Name</label>
                                                    <input
                                                        type="text"
                                                        value={med.name}
                                                        onChange={(e) => updateNewMedicine(idx, 'name', e.target.value)}
                                                        placeholder="e.g. Paracetamol"
                                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-medical-600 uppercase tracking-wider">Dosage</label>
                                                        <input
                                                            type="text"
                                                            value={med.dosage}
                                                            onChange={(e) => updateNewMedicine(idx, 'dosage', e.target.value)}
                                                            placeholder="e.g. 500mg"
                                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-medical-600 uppercase tracking-wider">Qty</label>
                                                        <input
                                                            type="number"
                                                            value={med.quantity}
                                                            onChange={(e) => updateNewMedicine(idx, 'quantity', e.target.value)}
                                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-medical-600 uppercase tracking-wider">Frequency</label>
                                                    <select
                                                        value={med.frequency}
                                                        onChange={(e) => updateNewMedicine(idx, 'frequency', e.target.value)}
                                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                                    >
                                                        <option value="1">Once a day</option>
                                                        <option value="2">Twice a day</option>
                                                        <option value="3">Three times a day</option>
                                                        <option value="4">Four times a day</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-medical-600 uppercase tracking-wider">Reminder Times</label>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {med.reminderTimes.map((time, tIdx) => (
                                                            <input
                                                                key={tIdx}
                                                                type="time"
                                                                value={time}
                                                                onChange={(e) => updateNewMedicineReminderTime(idx, tIdx, e.target.value)}
                                                                className="p-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-medical-500 outline-none"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-medical-600 uppercase tracking-wider">Dates</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="date"
                                                            value={med.startDate}
                                                            onChange={(e) => updateNewMedicine(idx, 'startDate', e.target.value)}
                                                            className="flex-1 p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                                                            required
                                                        />
                                                        <span className="text-gray-400">→</span>
                                                        <input
                                                            type="date"
                                                            value={med.endDate}
                                                            onChange={(e) => updateNewMedicine(idx, 'endDate', e.target.value)}
                                                            className="flex-1 p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-medical-600 uppercase tracking-wider">Instructions</label>
                                                    <input
                                                        type="text"
                                                        value={med.instructions}
                                                        onChange={(e) => updateNewMedicine(idx, 'instructions', e.target.value)}
                                                        placeholder="e.g. Take after breakfast"
                                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addMedicineCard}
                                    className="w-full py-4 border-2 border-dashed border-medical-200 rounded-2xl text-medical-600 font-bold hover:bg-medical-50 hover:border-medical-300 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <div className="w-8 h-8 bg-medical-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    Add Another Medicine
                                </button>
                            </form>

                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddMedicine(false)}
                                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddMedicine}
                                    disabled={addingMedicine}
                                    className="flex-[2] py-3 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 shadow-lg shadow-medical-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {addingMedicine ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Assigning...
                                        </>
                                    ) : (
                                        `Finalize & Assign ${medicines.length} Medicine${medicines.length > 1 ? 's' : ''}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Medicine Modal */}
                {showEditMedicine && editingMedicine && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-up">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-bold text-gray-900">Update Medicine Assignment</h3>
                                <button onClick={() => setShowEditMedicine(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleUpdateMedicine} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Name</label>
                                    <input
                                        type="text"
                                        value={editingMedicine.name}
                                        onChange={(e) => setEditingMedicine({ ...editingMedicine, name: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Dosage</label>
                                        <input
                                            type="text"
                                            value={editingMedicine.dosage}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, dosage: e.target.value })}
                                            placeholder="e.g. 1-0-1 or 500mg"
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Frequency (Daily)</label>
                                        <input
                                            type="number"
                                            value={editingMedicine.frequency}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, frequency: parseInt(e.target.value) })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reminder Timings (24h format, comma separated)</label>
                                    <input
                                        type="text"
                                        value={editingMedicine.reminderTime}
                                        onChange={(e) => setEditingMedicine({ ...editingMedicine, reminderTime: e.target.value })}
                                        placeholder="08:00, 14:00, 20:00"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all"
                                        required
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Example: 08:30, 20:30 (Use 'test-2min' for quick test)</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={new Date(editingMedicine.startDate).toISOString().split('T')[0]}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, startDate: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={new Date(editingMedicine.endDate).toISOString().split('T')[0]}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, endDate: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Instructions (Optional)</label>
                                    <textarea
                                        value={editingMedicine.instructions || ''}
                                        onChange={(e) => setEditingMedicine({ ...editingMedicine, instructions: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 transition-all h-20"
                                        placeholder="e.g. After food"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditMedicine(false)}
                                        className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updatingMedicine}
                                        className="flex-1 py-3 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 shadow-lg shadow-medical-200 transition-all disabled:opacity-50"
                                    >
                                        {updatingMedicine ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Permanent Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in text-gray-900">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up border border-red-100">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Permanent Deletion?</h3>
                            <p className="text-gray-500 text-center mb-6">
                                Are you sure you want to completely remove **{patient.name}**? This action will permanently delete all medical history, prescriptions, and records. This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePermanentDelete}
                                    disabled={deletingPatient}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deletingPatient ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Permanently Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
