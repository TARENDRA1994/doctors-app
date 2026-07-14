import { prisma } from '../../lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Phone, CheckCircle2, Calendar, MessageSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react'


// Using centralized prisma

async function getLead(slug: string) {
    return await prisma.lead.findUnique({
        where: { slug }
    })
}

export default async function ShowcasePage({ params }: { params: { slug: string } }) {
    const lead = await getLead(params.slug)

    if (!lead) {
        notFound()
    }

    const photos = lead.photos ? JSON.parse(lead.photos) : []
    const heroImage = photos[0] || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1600"

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Zap size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-800 uppercase">HealthNuero Showcase</span>
                </div>
                <Link 
                    href="/register" 
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 text-sm"
                >
                    Claim This Website
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center pt-20">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('${heroImage}')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent" />
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-md border border-white/20 rounded-full text-indigo-100 mb-6 animate-fade-in">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Proposed Landing Page for {lead.clinicName}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-sm">
                            Experience the future of <span className="text-indigo-400">patient care</span>.
                        </h1>
                        <p className="text-xl text-slate-200 mb-10 leading-relaxed font-medium">
                            {lead.clinicName} is more than a clinic. It's where technology meets healing. Manage your practice, automate reminders, and grow your presence.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-10 py-5 bg-indigo-600 text-white text-lg font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 active:scale-95">
                                Demo Appointment <ArrowRight size={20} />
                            </button>
                            <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-lg font-black rounded-2xl hover:bg-white/20 transition-all active:scale-95">
                                Our Services
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Cards */}
            <section className="bg-white py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Location */}
                        <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform">
                                <MapPin size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-4">Visit Us</h3>
                            <p className="text-slate-500 leading-relaxed font-medium mb-6">{lead.address || "Contact clinic for details."}</p>
                            <Link href="#" className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                                Directions <ArrowRight size={14} />
                            </Link>
                        </div>

                        {/* Contact */}
                        <div className="p-10 rounded-[2.5rem] bg-indigo-600 text-white border border-indigo-500 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all group">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                                <Phone size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-4">Contact</h3>
                            <p className="text-indigo-100 leading-relaxed font-medium mb-6 font-mono text-xl">{lead.phone || "No phone listed"}</p>
                            <Link href="#" className="text-white font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                                Call Now <ArrowRight size={14} />
                            </Link>
                        </div>

                        {/* Rating */}
                        <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 transition-transform">
                                <Star size={28} fill="currentColor" />
                            </div>
                            <h3 className="text-2xl font-black mb-4">Clinic Rating</h3>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-4xl font-black text-slate-800">{lead.rating || "5.0"}</span>
                                <div className="flex gap-1 text-amber-500">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                            </div>
                            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs italic">Based on Google Reviews</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smart Features (Marketing) */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Built-in <span className="text-indigo-600 italic">Smart Care</span>.</h2>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium">
                        Our platform integrates directly with your existing setup to automate patient engagement and monitoring without adding extra work.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex gap-6 group">
                        <div className="flex-shrink-0 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <MessageSquare size={32} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-xl font-bold mb-2">WhatsApp Automation</h4>
                            <p className="text-slate-500 leading-relaxed">
                                Automated medicine reminders and appointment alerts sent directly via WhatsApp. No more manual calls.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6 group">
                        <div className="flex-shrink-0 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Calendar size={32} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-xl font-bold mb-2">Smart Scheduling</h4>
                            <p className="text-slate-500 leading-relaxed">
                                Unified dashboard for clinic appointments, rescheduling, and status tracking in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-indigo-600 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute -top-1/2 -left-1/4 w-[100%] h-[200%] rotate-12 bg-white blur-3xl rounded-[100%]" />
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-10 leading-tight">
                        Power your clinic with <br /> <span className="text-indigo-200 uppercase tracking-tighter">HealthNuero</span>
                    </h2>
                    <p className="text-2xl text-indigo-100 mb-12 font-medium opacity-90">
                        Join hundreds of doctors who have modernised their practice. Claim this page and start managing your patients today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link 
                            href="/register" 
                            className="w-full sm:w-auto px-12 py-6 bg-white text-indigo-600 text-xl font-black rounded-3xl hover:bg-slate-50 transition-all shadow-2xl active:scale-95"
                        >
                            Claim Dashboard
                        </Link>
                        <Link 
                            href="/login" 
                            className="w-full sm:w-auto px-12 py-6 bg-transparent border-2 border-white/40 text-white text-xl font-black rounded-3xl hover:bg-white/10 transition-all active:scale-95"
                        >
                            Doctor Login
                        </Link>
                    </div>
                    <p className="mt-10 text-indigo-300 font-bold max-w-sm mx-auto flex items-center justify-center gap-2">
                        <ShieldCheck size={18} /> TRUSTED BY CLINICS WORLDWIDE
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 px-6 border-t border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <Zap size={16} />
                        </div>
                        <span className="text-white font-black tracking-tighter">HealthNuero</span>
                    </div>
                    <p className="text-slate-500 font-medium">© 2026 HealthNuero Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
