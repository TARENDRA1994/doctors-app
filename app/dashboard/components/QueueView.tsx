'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, RefreshCw, X, Play, CheckCircle } from 'lucide-react'

interface QueueToken {
  id: number
  patientName: string
  patientPhone: string
  tokenNumber: number
  status: string
  date: string
}

export default function QueueView() {
  const [tokens, setTokens] = useState<QueueToken[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0])

  const [showAdd, setShowAdd] = useState(false)
  const [offlineForm, setOfflineForm] = useState({ patientName: '', patientPhone: '' })

  const fetchTokens = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/queue/admin?date=${dateStr}`)
      const data = await res.json()
      if (res.ok) setTokens(data)
      else throw new Error(data.error)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTokens()
    const interval = setInterval(fetchTokens, 30000)
    return () => clearInterval(interval)
  }, [dateStr])

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/queue/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: id, status })
      })
      if (res.ok) fetchTokens()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddOffline = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/queue/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...offlineForm, dateStr })
      })
      if (res.ok) {
        setShowAdd(false)
        setOfflineForm({ patientName: '', patientPhone: '' })
        fetchTokens()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const currentRunning = tokens.find(t => t.status === 'IN_PROGRESS')

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-black text-slate-800">Token Queue</h2>
           <p className="text-sm text-slate-500">Manage patient walk-ins and online tokens</p>
        </div>
        <div className="flex gap-4">
           <input 
             type="date" 
             value={dateStr}
             onChange={(e) => setDateStr(e.target.value)}
             className="px-4 py-2 border border-slate-200 rounded-xl"
           />
           <button 
             onClick={fetchTokens}
             className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center"
           >
             <RefreshCw size={16} className="mr-2" /> Refresh
           </button>
           <button 
             onClick={() => setShowAdd(true)}
             className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center"
           >
             <Plus size={16} className="mr-2" /> Offline Token
           </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 mb-8">
          <h3 className="font-bold text-lg mb-4">Add Walk-in Patient</h3>
          <form onSubmit={handleAddOffline} className="flex gap-4">
            <input 
              type="text" 
              required 
              placeholder="Patient Name" 
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl"
              value={offlineForm.patientName}
              onChange={e => setOfflineForm({ ...offlineForm, patientName: e.target.value })}
            />
            <input 
              type="tel" 
              required 
              placeholder="Phone Number" 
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl"
              value={offlineForm.patientPhone}
              onChange={e => setOfflineForm({ ...offlineForm, patientPhone: e.target.value })}
            />
            <button type="submit" className="px-6 bg-indigo-600 text-white rounded-xl font-bold">Add to Queue</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
         <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex-1">
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Currently Running</p>
               <p className="text-4xl font-black text-indigo-600">
                 {currentRunning ? `#${currentRunning.tokenNumber} - ${currentRunning.patientName}` : 'None'}
               </p>
            </div>
            <div className="text-right">
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Tokens Today</p>
               <p className="text-4xl font-black text-slate-800">{tokens.length}</p>
            </div>
         </div>

         {loading && tokens.length === 0 ? (
           <p className="text-center text-slate-500 py-8">Loading queue...</p>
         ) : tokens.length === 0 ? (
           <p className="text-center text-slate-500 py-8">No tokens for this date.</p>
         ) : (
           <div className="space-y-4">
             {tokens.map(token => (
               <div key={token.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-2xl font-black text-slate-800 border border-slate-200">
                      #{token.tokenNumber}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{token.patientName}</p>
                      <p className="text-sm text-slate-500">{token.patientPhone}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                        token.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        token.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        token.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800' :
                        token.status === 'COMPLETED' ? 'bg-slate-200 text-slate-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {token.status}
                      </span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    {token.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleStatusUpdate(token.id, 'CONFIRMED')} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl" title="Confirm"><Check size={20} /></button>
                        <button onClick={() => handleStatusUpdate(token.id, 'CANCELLED')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl" title="Reject"><X size={20} /></button>
                      </>
                    )}
                    {token.status === 'CONFIRMED' && (
                      <button onClick={() => handleStatusUpdate(token.id, 'IN_PROGRESS')} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-xl flex items-center" title="Start">
                        <Play size={16} className="mr-2" /> Start
                      </button>
                    )}
                    {token.status === 'IN_PROGRESS' && (
                      <button onClick={() => handleStatusUpdate(token.id, 'COMPLETED')} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold rounded-xl flex items-center" title="Complete">
                        <CheckCircle size={16} className="mr-2" /> Finish
                      </button>
                    )}
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  )
}
