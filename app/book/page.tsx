import { prisma } from '@/app/lib/prisma'
import BookTokenClient from './BookTokenClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BookTokenPage() {
  const doctors = await prisma.doctor.findMany({
    select: {
      id: true,
      name: true,
      clinicName: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto w-full mb-8">
        <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </div>

      <div className="max-w-md mx-auto w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Book Appointment</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Request an appointment for your visit.
          </p>
        </div>
        
        <BookTokenClient doctors={doctors} />
      </div>
    </div>
  )
}
