'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function RestrictionOverlay() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-medical-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-medical-100">
                <div className="bg-gradient-to-br from-medical-500 to-medical-700 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white/30">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Access Restricted</h1>
                    <p className="text-medical-100 mt-2 font-medium">Your subscription is currently inactive</p>
                </div>

                <div className="p-10 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-medical-50 rounded-lg text-medical-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">Automate WhatsApp medicine reminders for all your patients.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-medical-50 rounded-lg text-medical-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">Receive patient feedback alerts directly on your dashboard.</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <button
                            onClick={() => router.push('/dashboard/billing')}
                            className="w-full py-4 bg-gradient-to-r from-medical-600 to-medical-500 text-white rounded-2xl font-bold text-lg shadow-medical-lg hover:shadow-medical-xl transform hover:-translate-y-1 transition-all duration-200"
                        >
                            Activate Pro Plan
                        </button>
                        <button
                            onClick={() => signOut()}
                            className="w-full py-3 bg-white text-gray-500 border-2 border-gray-100 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-200"
                        >
                            Sign Out
                        </button>
                    </div>

                    <p className="text-xs text-center text-gray-400">
                        Need help? Contact support@doctorsnode.in
                    </p>
                </div>
            </div>
        </div>
    )
}
