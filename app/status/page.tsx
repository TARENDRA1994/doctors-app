'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Search } from 'lucide-react'

function StatusClient() {
  const searchParams = useSearchParams()
  const initialPhone = searchParams.get('phone') || ''

  const [phone, setPhone] = useState(initialPhone)
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const fetchStatus = async (phoneNumber: string) => {
    if (!phoneNumber) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/queue/public/status?phone=${encodeURIComponent(phoneNumber)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch status')
      setTokens(data)
      setHasSearched(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialPhone) {
      fetchStatus(initialPhone)
    }
  }, [initialPhone])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStatus(phone)
  }

  return (
    <div className="max-w-md mx-auto w-full space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
             <Search size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Token Status</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Enter your phone number to check your queue position.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 text-center text-lg font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-md focus:outline-none transition-all disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}
      </div>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl font-black text-slate-800">Your Tokens</h3>
             <button 
                onClick={() => fetchStatus(phone)}
                className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
             >
               <RefreshCw size={14} className="mr-1.5" /> Refresh
             </button>
          </div>
          
          {tokens.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border border-slate-100">
              <p className="text-slate-500 font-medium">No active tokens found for this number.</p>
            </div>
          ) : (
            tokens.map((token) => (
              <div key={token.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${
                    token.status === 'CONFIRMED' ? 'bg-green-500' :
                    token.status === 'IN_PROGRESS' ? 'bg-indigo-500' :
                    token.status === 'COMPLETED' ? 'bg-slate-300' :
                    token.status === 'CANCELLED' ? 'bg-red-500' :
                    'bg-amber-500'
                }`} />
                <div className="pl-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor / Clinic</p>
                            <p className="font-bold text-slate-800">{token.doctor.name}</p>
                            <p className="text-sm text-slate-500">{token.doctor.clinicName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                            <p className="font-bold text-slate-700">{new Date(token.date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-6 pt-6 border-t border-slate-100">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your Token</p>
                            <p className="text-4xl font-black text-slate-900">#{token.tokenNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Currently Running</p>
                            {token.currentlyRunning ? (
                                <p className="text-4xl font-black text-indigo-600">#{token.currentlyRunning}</p>
                            ) : (
                                <p className="text-xl font-bold text-slate-400 mt-2">Not Started</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border" style={{
                        borderColor: token.status === 'CONFIRMED' ? '#86efac' : token.status === 'IN_PROGRESS' ? '#a5b4fc' : '#e2e8f0',
                        color: token.status === 'CONFIRMED' ? '#166534' : token.status === 'IN_PROGRESS' ? '#3730a3' : '#475569',
                        backgroundColor: token.status === 'CONFIRMED' ? '#f0fdf4' : token.status === 'IN_PROGRESS' ? '#e0e7ff' : '#f8fafc'
                    }}>
                        Status: {token.status}
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto w-full mb-8">
        <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </div>
      
      <Suspense fallback={<div className="text-center font-bold">Loading...</div>}>
        <StatusClient />
      </Suspense>
    </div>
  )
}
