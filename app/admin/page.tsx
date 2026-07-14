'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, Plus, ExternalLink, MessageSquare, Star, MapPin, Phone, Users, Zap, Briefcase } from 'lucide-react'
import Link from 'next/link'

interface Doctor {
    id: number
    name: string
    clinicName: string
    email: string
    subscriptionStatus: string
    planType: string
    whatsappMsgCount: number
    subscriptionExpiry: string | null
    createdAt: string
    _count: {
        patients: number
    }
}

interface Lead {
    id: number
    clinicName: string
    doctorName?: string
    address?: string
    phone?: string
    rating?: number
    photos?: string
    slug: string
    status: string
    createdAt: string
}

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'DOCTORS' | 'LEADS'>('DOCTORS')
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<number | null>(null)
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])

    useEffect(() => {
        if (status === 'loading') return
        if (!session?.user || !(session.user as any).isAdmin) {
            router.push('/dashboard')
            return
        }
        fetchDoctors()
        fetchLeads()
    }, [session, status])

    const fetchDoctors = async () => {
        try {
            const res = await fetch('/api/admin/doctors')
            if (res.ok) {
                const data = await res.json()
                setDoctors(data)
            }
        } catch (error) {
            console.error('Error fetching doctors:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/admin/leads')
            if (res.ok) {
                const data = await res.json()
                setLeads(data)
            }
        } catch (error) {
            console.error('Error fetching leads:', error)
        }
    }

    const handleSearch = async () => {
        if (!searchQuery) return
        setIsSearching(true)
        try {
            const res = await fetch(`/api/admin/leads?q=${encodeURIComponent(searchQuery)}`)
            if (res.ok) {
                const data = await res.json()
                setSearchResults(data)
            }
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const createLead = async (result: any) => {
        try {
            const res = await fetch('/api/admin/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result)
            })
            if (res.ok) {
                fetchLeads()
                setSearchResults([])
                setSearchQuery('')
            }
        } catch (error) {
            console.error('Error creating lead:', error)
        }
    }

    const updateDoctor = async (id: number, data: any) => {
        setUpdatingId(id)
        try {
            const res = await fetch('/api/admin/doctors', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data })
            })
            if (res.ok) {
                fetchDoctors()
            }
        } catch (error) {
            console.error('Error updating doctor:', error)
        } finally {
            setUpdatingId(null)
        }
    }

    const shareOnWhatsApp = (lead: Lead) => {
        const appUrl = window.location.origin
        const showcaseUrl = `${appUrl}/p/${lead.slug}`
        const message = `Hello Dr. ${lead.doctorName || lead.clinicName},\n\nI've created a premium showcase landing page for your clinic to show how HealthNuero can help you manage patients and automate reminders.\n\nCheck it out here: ${showcaseUrl}\n\nLet me know if you would like to claim your full dashboard!`
        window.open(`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Admin Portal...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Zap className="text-indigo-600" size={36} />
                            Super Admin Portal
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Manage growth, doctors, and platform leads</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 bg-gray-200/50 p-1.5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('DOCTORS')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'DOCTORS' 
                            ? 'bg-white text-indigo-600 shadow-md' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Users size={18} /> Doctors
                    </button>
                    <button
                        onClick={() => setActiveTab('LEADS')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'LEADS' 
                            ? 'bg-white text-indigo-600 shadow-md' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Briefcase size={18} /> Lead Gen
                    </button>
                </div>

                {activeTab === 'DOCTORS' ? (
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Doctor / Clinic</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Plan</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Msgs Sent</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Expiry</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {doctors.map((doctor) => (
                                    <tr key={doctor.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-800">{doctor.name}</p>
                                            <p className="text-sm text-gray-500">{doctor.clinicName} • {doctor.email}</p>
                                            <p className="text-xs text-indigo-600 font-medium mt-1 uppercase tracking-tight">{doctor._count.patients} Patients registered</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <select
                                                value={doctor.subscriptionStatus}
                                                onChange={(e) => updateDoctor(doctor.id, { subscriptionStatus: e.target.value })}
                                                disabled={updatingId === doctor.id}
                                                className={`px-3 py-1.5 rounded-lg font-bold text-xs border-0 outline-none ring-2 ${doctor.subscriptionStatus === 'ACTIVE'
                                                        ? 'bg-green-50 text-green-700 ring-green-100'
                                                        : 'bg-amber-50 text-amber-700 ring-amber-100'
                                                    }`}
                                            >
                                                <option value="ACTIVE text-green-600 font-bold">ACTIVE</option>
                                                <option value="INACTIVE text-red-600 font-bold">INACTIVE</option>
                                                <option value="TRIAL text-amber-600 font-bold">TRIAL</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={doctor.planType}
                                                onChange={(e) => updateDoctor(doctor.id, { planType: e.target.value })}
                                                disabled={updatingId === doctor.id}
                                                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100 font-bold text-xs border-0 outline-none cursor-pointer"
                                            >
                                                <option value="TRIAL">TRIAL</option>
                                                <option value="STARTER">STARTER (₹999)</option>
                                                <option value="PRO">PRO (₹2499)</option>
                                                <option value="HOSPITAL">HOSPITAL (₹4999)</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-lg font-black text-indigo-600">{doctor.whatsappMsgCount}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Messages</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-medium text-sm text-gray-600">
                                            <input
                                                type="date"
                                                value={doctor.subscriptionExpiry ? doctor.subscriptionExpiry.split('T')[0] : ''}
                                                onChange={(e) => updateDoctor(doctor.id, { subscriptionExpiry: e.target.value })}
                                                className="bg-transparent border-0 outline-none hover:text-indigo-600 transition-colors"
                                            />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`text-[10px] font-bold ${updatingId === doctor.id ? 'animate-pulse text-indigo-600' : 'text-gray-300'}`}>
                                                {updatingId === doctor.id ? 'UPDATING...' : 'SAVED'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Search Section */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center gap-2 text-indigo-600">
                                <Search size={24} /> Automated Lead Finder
                            </h2>
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Search Clinic or Doctor (e.g., Cardiology Clinic Bangalore)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 font-bold px-4">POWERED BY GOOGLE PLACES API</p>
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
                                >
                                    {isSearching ? 'FINDING...' : 'SEARCH LEADS'}
                                </button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top duration-500">
                                    {searchResults.map((result, idx) => (
                                        <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col justify-between hover:border-indigo-200 transition-colors group">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-black text-xl text-slate-800">{result.clinicName}</h3>
                                                        <div className="flex items-center gap-1 mt-1 text-amber-500">
                                                            <Star size={14} fill="currentColor" />
                                                            <span className="text-sm font-bold text-slate-600">{result.rating || 'N/A'} Rating</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => createLead(result)}
                                                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                                                        title="Add to Leads"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                </div>
                                                <div className="space-y-2 text-sm text-slate-500 font-medium">
                                                    <p className="flex items-center gap-2"><MapPin size={14} /> {result.address}</p>
                                                    <p className="flex items-center gap-2"><Phone size={14} /> {result.phone || 'No phone data'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Saved Leads List */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Active Leads ({leads.length})</h2>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-10 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Clinic / Info</th>
                                        <th className="px-10 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-10 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 uppercase tracking-tight font-medium">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-10 py-8">
                                                <p className="font-black text-slate-800 text-lg">{lead.clinicName}</p>
                                                <p className="text-sm text-slate-400 flex items-center gap-1 mt-1"><MapPin size={12} /> {lead.address}</p>
                                                <p className="text-sm text-slate-400 flex items-center gap-1"><Phone size={12} /> {lead.phone || 'N/A'}</p>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${
                                                    lead.status === 'NEW' ? 'bg-indigo-50 text-indigo-600' :
                                                    lead.status === 'CONTACTED' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-green-50 text-green-600'
                                                }`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        href={`/p/${lead.slug}`}
                                                        target="_blank"
                                                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                                                        title="Live Preview"
                                                    >
                                                        <ExternalLink size={20} />
                                                    </Link>
                                                    <button
                                                        onClick={() => shareOnWhatsApp(lead)}
                                                        className="p-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-100 flex items-center gap-2 group"
                                                    >
                                                        <MessageSquare size={20} />
                                                        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 text-xs font-black">SHARE ON WHATSAPP</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {leads.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-10 py-20 text-center text-slate-400 font-bold italic">
                                                No leads yet. Use the search bar above to find your first clinic!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

