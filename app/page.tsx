'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Navbar from '@/components/marketing/Navbar'
import Hero from '@/components/marketing/Hero'
import Features from '@/components/marketing/Features'
import Footer from '@/components/marketing/Footer'
import WhatsAppButton from '@/components/marketing/WhatsAppButton'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <main className="min-h-screen bg-white selection:bg-teal-100 selection:text-teal-900">
      <Navbar />
      
      <Hero />

      {/* Trust Section */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-8">
            Empowering modern clinics across India
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos represent trust, even if placeholder-style */}
            <div className="text-2xl font-black text-slate-900">CLINIC+</div>
            <div className="text-2xl font-black text-slate-900">DOC.SYNC</div>
            <div className="text-2xl font-black text-slate-900">MEDTRACK</div>
            <div className="text-2xl font-black text-slate-900">HEALTH.OS</div>
          </div>
        </div>
      </section>

      <Features />

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-600"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-500 via-transparent to-transparent opacity-50"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-6xl font-extrabold mb-8 leading-tight"
          >
            Ready to give your patients <br />
            <span className="text-teal-200">the care they deserve?</span>
          </motion.h2>
          <p className="text-xl text-teal-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of doctors who are already saving hours every week with automated workflows and AI diet planning.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-white text-teal-600 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-transform"
            >
              Start Your Free Trial
            </Link>
            {session ? (
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto flex items-center justify-center space-x-2 text-white font-bold text-xl group"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="w-full sm:w-auto flex items-center justify-center space-x-2 text-white font-bold text-xl group"
              >
                <span>Member Login</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
      
      <WhatsAppButton />
    </main>
  )
}