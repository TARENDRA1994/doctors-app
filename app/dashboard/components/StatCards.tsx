'use client'

interface StatCardsProps {
    totalPatients: number
    totalMedicines: number
    pendingReminders: number
    onTotalPatientsClick?: () => void
    onTotalMedicinesClick?: () => void
    onPendingRemindersClick?: () => void
}

export default function StatCards({
    totalPatients,
    totalMedicines,
    pendingReminders,
    onTotalPatientsClick,
    onTotalMedicinesClick,
    onPendingRemindersClick
}: StatCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div
                onClick={onTotalPatientsClick}
                className="medical-card p-5 flex items-center gap-4 cursor-pointer hover:shadow-medical-lg transform hover:-translate-y-1 transition-all duration-300 group"
            >
                <div className="w-12 h-12 bg-medical-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-medical-200 transition-colors">
                    <svg className="w-6 h-6 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-800">{totalPatients}</p>
                    <p className="text-sm text-gray-500">Total Patients</p>
                </div>
            </div>
            <div
                onClick={onTotalMedicinesClick}
                className="medical-card p-5 flex items-center gap-4 cursor-pointer hover:shadow-medical-lg transform hover:-translate-y-1 transition-all duration-300 group"
            >
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent-200 transition-colors">
                    <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-800">{totalMedicines}</p>
                    <p className="text-sm text-gray-500">Active Medicines</p>
                </div>
            </div>
            <div
                onClick={onPendingRemindersClick}
                className="medical-card p-5 flex items-center gap-4 cursor-pointer hover:shadow-medical-lg transform hover:-translate-y-1 transition-all duration-300 group"
            >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-800">{pendingReminders}</p>
                    <p className="text-sm text-gray-500">Pending Reminders</p>
                </div>
            </div>
        </div>
    )
}
