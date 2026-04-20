'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react'

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
    <main className="min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <div className="pt-40 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100"
          >
            <div className="mb-10 text-center">
               <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <LogIn className="w-8 h-8 text-teal-600" />
               </div>
               <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
               <p className="text-slate-500 font-medium">Access your clinical dashboard</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
              >
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input
                    type="email"
                    required
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                    placeholder="doctor@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative">
                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input
                    type="password"
                    required
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                   />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-teal-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500 text-sm font-medium">
                Don&apos;t have an account?{' '}
                <a href="/register" className="text-teal-600 font-black hover:underline underline-offset-4">Register as Doctor</a>
              </p>
              
              <div className="mt-8 pt-8 border-t border-slate-50">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Patient Access</p>
                <div className="flex justify-center gap-6">
                   <a href="/p/login" className="text-slate-600 font-black hover:text-teal-600 transition-colors">Login</a>
                   <span className="text-slate-200">|</span>
                   <a href="/p/register" className="text-slate-600 font-black hover:text-teal-600 transition-colors">Register</a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}