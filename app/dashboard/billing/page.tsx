'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BillingPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null)

    const handlePlanClick = (planName: string, price: string) => {
        setSelectedPlan({ name: planName, price: price })
        setShowPaymentModal(true)
    }

    const notifyDeveloper = () => {
        const message = encodeURIComponent(`Hi, I would like to activate the ${selectedPlan?.name} plan for my clinic. I have completed the payment of ${selectedPlan?.price}. My doctor name is: ${session?.user?.name || 'Doctor'}`)
        window.open(`https://wa.me/918839224094?text=${message}`, '_blank')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-medical-50/30 to-accent-50/30 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto text-center mb-16">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center gap-2 text-medical-600 font-medium hover:text-medical-700 transition-colors mb-8 group"
                >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">
                    Simple, Transparent <span className="text-gradient-medical">Pricing</span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-gray-500">
                    Choose the best plan for your clinic and start managing your patients more effectively today.
                </p>
            </div>

            {/* Pricing Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Starter Plan */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col transform hover:scale-105 transition-all duration-300">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                        <p className="text-gray-500 mt-2">Perfect for single clinicians</p>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-5xl font-extrabold text-gray-900">₹999</span>
                            <span className="text-gray-500 ml-1">/month</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1">
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Up to 50 Patients
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Standard WhatsApp Reminders
                        </li>
                    </ul>
                    <button
                        onClick={() => handlePlanClick('Starter', '₹999')}
                        className="w-full py-4 px-6 rounded-2xl bg-gray-50 text-medical-600 font-bold hover:bg-medical-50 transition-colors"
                    >
                        Buy Starter
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-3xl shadow-medical-xl border-2 border-medical-500 p-8 flex flex-col relative transform hover:scale-105 transition-all duration-300 z-10">
                    <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-medical-600 to-accent-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        MOST POPULAR
                    </div>
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                        <p className="text-gray-500 mt-2">Ideal for growing practices</p>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-5xl font-extrabold text-medical-600">₹2499</span>
                            <span className="text-gray-500 ml-1">/month</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1">
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-medical-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Unlimited Patients
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-medical-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Advanced Compliance Reports
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-medical-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Priority Support
                        </li>
                    </ul>
                    <button
                        onClick={() => handlePlanClick('Pro', '₹2499')}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold shadow-medical-lg hover:shadow-medical-xl transition-all"
                    >
                        Buy Pro
                    </button>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col transform hover:scale-105 transition-all duration-300">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">Hospital</h3>
                        <p className="text-gray-500 mt-2">Custom solutions for institutions</p>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-5xl font-extrabold text-gray-900">Custom</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1">
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Multi-Doctor Support
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Dedicated Account Manager
                        </li>
                    </ul>
                    <button
                        onClick={() => window.open('https://wa.me/918839224094?text=Interested in Hospital Plan', '_blank')}
                        className="w-full py-4 px-6 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-colors"
                    >
                        Contact Sales
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden animate-slide-up border border-white/20">
                        <div className="bg-gradient-to-br from-medical-600 to-medical-700 p-8 text-white text-center relative">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <h3 className="text-2xl font-bold mb-1">Secure Payment</h3>
                            <p className="text-medical-100 text-sm">Scan to pay for {selectedPlan?.name} Plan</p>
                        </div>

                        <div className="p-8 text-center">
                            {/* QR Code Placeholder */}
                            <div className="w-56 h-56 bg-white mx-auto mb-6 p-4 rounded-3xl shadow-medical border border-medical-50 flex items-center justify-center relative group">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=8839224094@ybl%26pn=SanjeevaniBharat%26am=${selectedPlan?.price.replace('₹', '') || ''}%26cu=INR`}
                                    alt="Payment QR Code"
                                    className="w-full h-full rounded-xl"
                                />
                                <div className="absolute inset-0 bg-medical-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="bg-medical-50 p-4 rounded-2xl border border-medical-100">
                                    <p className="text-xs font-bold text-medical-600 uppercase tracking-widest mb-1">UPI ID</p>
                                    <p className="text-lg font-mono text-gray-800 font-bold select-all cursor-pointer hover:text-medical-600 transition-colors" title="Click to copy">
                                        8839224094@ybl
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Plan Amount</p>
                                    <p className="text-2xl font-extrabold text-gray-900">{selectedPlan?.price}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={notifyDeveloper}
                                    className="w-full py-4 bg-gradient-to-r from-medical-600 to-medical-500 text-white rounded-2xl font-bold text-lg shadow-medical-lg hover:shadow-medical-xl transition-all flex items-center justify-center gap-3"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    Confirm & Notify Owner
                                </button>
                                <p className="text-[10px] text-gray-400">
                                    After paying, click "Confirm" to send your receipt info via WhatsApp.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                            <p className="text-xs text-gray-500">Secure Payments for Local Clinics</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Trust Badges */}
            <div className="max-w-7xl mx-auto mt-20 text-center">
                <p className="text-gray-400 font-semibold uppercase tracking-widest text-sm mb-8">Trusted by Doctors across India</p>
                <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
                    {/* Mock Logos */}
                    <div className="text-2xl font-bold">HealthCare Plus</div>
                    <div className="text-2xl font-bold">MediSoft</div>
                    <div className="text-2xl font-bold">ClinicPro</div>
                    <div className="text-2xl font-bold">DocAssist</div>
                </div>
            </div>

            <footer className="mt-20 text-center text-gray-400 text-sm">
                <p>© 2026 SanjeevaniBharat Inc. Powered by WhatsApp Business API.</p>
            </footer>
        </div>
    )
}
