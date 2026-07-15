'use client'

import { useState, useEffect } from 'react'
import { User, GraduationCap, Building2, MapPin, Globe, Award, Mail, Phone, Save, Loader2 } from 'lucide-react'

interface DoctorProfile {
    name: string
    email: string
    clinicName: string
    whatsappNumber: string
    qualification: string | null
    specialization: string | null
    degree: string | null
    address: string | null
    fellowships: string | null
    website: string | null
    googleReviewLink: string | null
    selectedTemplate: string
    consultationFee: number
}

export default function ProfileView() {
    const [profile, setProfile] = useState<DoctorProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetch('/api/doctor/profile')
            .then(res => res.json())
            .then(data => {
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    clinicName: data.clinicName || '',
                    whatsappNumber: data.whatsappNumber || '',
                    qualification: data.qualification || '',
                    specialization: data.specialization || '',
                    degree: data.degree || '',
                    address: data.address || '',
                    fellowships: data.fellowships || '',
                    website: data.website || '',
                    googleReviewLink: data.googleReviewLink || '',
                    selectedTemplate: data.selectedTemplate || 'TEMPLATE_1',
                    consultationFee: data.consultationFee || 500
                })
            })
            .catch(err => console.error('Error fetching profile:', err))
            .finally(() => setLoading(false))
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/doctor/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile.' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred while saving.' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin h-10 w-10 text-medical-600" />
                <p className="text-gray-500 font-medium">Loading your professional profile...</p>
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-20">
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Doctor Profile</h2>
                <p className="text-gray-500 text-lg mt-1">Manage your professional identity and clinical details.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* 1. Basic Identity */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-medical-900/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-medical-50 rounded-xl flex items-center justify-center text-medical-600">
                            <User size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Basic Identity</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                type="text"
                                value={profile.name}
                                onChange={e => setProfile({...profile, name: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                placeholder="Dr. John Smith"
                                required
                            />
                        </div>
                        <div className="space-y-2 opacity-60">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email (Primary)</label>
                            <div className="w-full px-6 py-4 bg-gray-100 border border-gray-100 rounded-[1.5rem] cursor-not-allowed flex items-center gap-3 text-gray-500">
                                <Mail size={16} />
                                {profile.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Professional Credentials */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-indigo-900/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <GraduationCap size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Professional Credentials</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Degree</label>
                            <input 
                                type="text"
                                value={profile.degree || ''}
                                onChange={e => setProfile({...profile, degree: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                placeholder="MBBS, MD"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Specialisation</label>
                            <input 
                                type="text"
                                value={profile.specialization || ''}
                                onChange={e => setProfile({...profile, specialization: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                placeholder="Cardiology, Pediatrics"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Qualification Summary</label>
                            <input 
                                type="text"
                                value={profile.qualification || ''}
                                onChange={e => setProfile({...profile, qualification: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                placeholder="Fellowship in Diabetology (RSSDI)"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Fellowships & Awards</label>
                            <textarea 
                                value={profile.fellowships || ''}
                                onChange={e => setProfile({...profile, fellowships: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none h-32"
                                placeholder="List your fellowships and key achievements..."
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Clinic Details */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-accent-900/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center text-accent-600">
                            <Building2 size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Clinic & Practice Presence</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Clinic Name</label>
                            <input 
                                type="text"
                                value={profile.clinicName}
                                onChange={e => setProfile({...profile, clinicName: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                placeholder="City Wellness Clinic"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text"
                                    value={profile.website || ''}
                                    onChange={e => setProfile({...profile, website: e.target.value})}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                    placeholder="www.yourclinic.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Google Maps Review Link</label>
                            <div className="relative">
                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text"
                                    value={profile.googleReviewLink || ''}
                                    onChange={e => setProfile({...profile, googleReviewLink: e.target.value})}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                    placeholder="https://g.page/r/..."
                                />
                            </div>
                            {!profile.googleReviewLink && (
                                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-amber-800">⚠️ You are missing out on new patients!</h4>
                                        <p className="text-xs text-amber-700 mt-1">You haven't set up a Google Profile Review Link yet. You cannot use the Automated Review Bot to gather 5-star ratings from your patients.</p>
                                    </div>
                                    <a 
                                        href="https://wa.me/919872954744?text=Hi,%20I%20need%20a%20Premium%20Clinic%20Website%20and%20Google%20Profile%20setup!" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="whitespace-nowrap px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-amber-700 transition-colors"
                                    >
                                        Get Setup (Contact Us)
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Clinic Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-6 text-gray-400" size={16} />
                                <textarea 
                                    value={profile.address || ''}
                                    onChange={e => setProfile({...profile, address: e.target.value})}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none h-24"
                                    placeholder="Enter full clinic address..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp for Business</label>
                            <div className="relative">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text"
                                    value={profile.whatsappNumber}
                                    onChange={e => setProfile({...profile, whatsappNumber: e.target.value})}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Consultation Fee (₹)</label>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
                                <input 
                                    type="number"
                                    value={profile.consultationFee || ''}
                                    onChange={e => setProfile({...profile, consultationFee: parseInt(e.target.value) || 0})}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-medical-500 transition-all outline-none"
                                    placeholder="500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Prescription Header Style */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-medical-900/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Award size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Prescription Header Style</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Template 1: Modern */}
                        <div 
                            onClick={() => setProfile({...profile!, selectedTemplate: 'TEMPLATE_1'})}
                            className={`cursor-pointer rounded-[2rem] border-2 transition-all overflow-hidden ${profile.selectedTemplate === 'TEMPLATE_1' ? 'border-medical-500 ring-4 ring-medical-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>Modern Digital</span>
                                {profile.selectedTemplate === 'TEMPLATE_1' && <span className="text-medical-600">Selected</span>}
                            </div>
                            <div className="p-6 bg-white space-y-3">
                                <div className="border-l-4 border-medical-500 pl-4">
                                    <h4 className="text-sm font-black text-gray-900">{profile.name || 'Dr. Name'}</h4>
                                    <p className="text-[10px] text-gray-500 font-bold">{profile.degree} {profile.specialization}</p>
                                </div>
                                <div className="text-[9px] text-gray-400 space-y-1">
                                    <p className="font-bold text-gray-600">{profile.clinicName}</p>
                                    <p>{profile.address}</p>
                                    <p className="text-medical-600 font-black">{profile.whatsappNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* Template 2: Professional Classic */}
                        <div 
                            onClick={() => setProfile({...profile!, selectedTemplate: 'TEMPLATE_2'})}
                            className={`cursor-pointer rounded-[2rem] border-2 transition-all overflow-hidden ${profile.selectedTemplate === 'TEMPLATE_2' ? 'border-medical-500 ring-4 ring-medical-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>Professional Classic</span>
                                {profile.selectedTemplate === 'TEMPLATE_2' && <span className="text-medical-600">Selected</span>}
                            </div>
                            <div className="p-6 bg-white flex flex-col items-center text-center">
                                <h4 className="text-base font-black text-gray-900 uppercase tracking-tight mb-1">{profile.name || 'Dr. Name'}</h4>
                                <p className="text-[10px] text-medical-600 font-black mb-3">{profile.degree} • {profile.specialization}</p>
                                <div className="w-full h-px bg-gray-100 mb-3"></div>
                                <div className="text-[9px] text-gray-500 space-y-1">
                                    <p className="font-bold text-gray-800">{profile.clinicName}</p>
                                    <p className="italic">{profile.address}</p>
                                    <p className="font-bold text-gray-400">{profile.website}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-gray-900 rounded-[2.5rem] shadow-2xl">
                    <div>
                        {message && (
                            <p className={`text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></span>
                                {message.text}
                            </p>
                        )}
                        {!message && <p className="text-gray-400 text-sm font-medium">Remember to save after any professional changes.</p>}
                    </div>
                    <button 
                        type="submit"
                        disabled={saving}
                        className="w-full md:w-auto px-10 py-5 bg-white text-gray-900 font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-medical-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4" />
                                Saving Details...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Update Professional Profile
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
