'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Left Panel - Image Panel Style from Screenshot */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0d9488] items-center justify-center relative overflow-hidden">
        <div className="relative z-10 w-full max-w-lg px-12 text-center text-white">
          {/* Logo & Header */}
          <div className="mb-10 flex flex-col items-center">
            <div className="w-24 h-24 mb-6 relative">
               <svg viewBox="0 0 100 100" className="w-full h-full text-white/90 drop-shadow-xl">
                 <path d="M50 90C50 90 20 65 20 45C20 35 28 28 38 28C44 28 48 31 50 35C52 31 56 28 62 28C72 28 80 35 80 45C80 65 50 90 50 90Z" fill="currentColor" opacity="0.4" />
                 <path d="M50 85C50 85 25 62 25 45C25 36 32 30 40 30C45 30 48 32 50 35C52 32 55 30 60 30C68 30 75 36 75 45C75 62 50 85 50 85Z" fill="currentColor" />
                 <path d="M15 50 L35 50 L40 35 L50 65 L60 40 L65 50 L85 50" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
               </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">DoctorsNode</h1>
            <p className="text-xl text-white/80 font-medium leading-relaxed">
              Smart Medicine Reminders for Healthcare
            </p>
          </div>

          {/* Feature Blocks */}
          <div className="space-y-5 text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex items-center space-x-5 border border-white/10 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" /></svg>
              </div>
              <p className="text-sm font-medium leading-normal">Schedule medicine reminders via WhatsApp</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex items-center space-x-5 border border-white/10 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a7 7 0 100 14A7 7 0 009 2zM4 9a5 5 0 1110 0A5 5 0 014 9z" /><path d="M12.293 12.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414z" /></svg>
              </div>
              <p className="text-sm font-medium leading-normal">Track patient adherence in real time</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex items-center space-x-5 border border-white/10 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-sm font-medium leading-normal">Manage prescriptions effortlessly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form Panel */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-8 lg:p-20 bg-white">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-[2.75rem] font-bold text-slate-800 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-lg font-medium">Sign in to manage your patients and reminders</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0d9488] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input 
                  type="email"
                  required
                  placeholder="doctor@clinic.com"
                  className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d9488] focus:border-transparent transition-all outline-none font-medium text-slate-800 placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0d9488] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input 
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d9488] focus:border-transparent transition-all outline-none font-medium text-slate-800 placeholder:text-slate-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d9488] hover:bg-[#0b7a6f] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-600/10 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Links Footer */}
          <div className="mt-8 text-center border-t border-slate-50 pt-8">
            <p className="text-slate-500 font-medium">
              Don&apos;t have an account? <a href="/register" className="text-[#0d9488] font-bold hover:underline ml-1">Register as Doctor</a>
            </p>
            <div className="mt-8 flex flex-col items-center space-y-4">
              <p className="text-slate-500 font-medium">
                Are you a Patient? <a href="/p/login" className="text-[#0d9488] font-bold hover:underline">Login</a> or <a href="/p/register" className="text-[#0d9488] font-bold hover:underline">Register</a>
              </p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Secure healthcare platform • HIPAA considerations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}