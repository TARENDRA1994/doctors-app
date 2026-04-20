'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Play, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const Hero = () => {
  return (
    <section className="relative pt-44 pb-32 overflow-hidden bg-white">
      {/* Mesh Gradients provided by CSS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-cyan-100/40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Animated Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/40 backdrop-blur-md border border-white/60 px-4 py-2 rounded-full text-slate-600 font-bold text-xs mb-8 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="tracking-widest uppercase">Trusted by 500+ Clinics</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8 max-w-5xl"
          >
            Healthcare <span className="text-blue-600">Unified.</span> <br />
            Patients Empowered.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 max-w-2xl mb-12 leading-relaxed"
          >
            The all-in-one automation engine for modern medical practices. WhatsApp reminders, AI-driven nutrition, and seamless scheduling.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20"
          >
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight size={24} />
            </Link>
            <Link 
              href="https://wa.me/918878914647?text=Hi! I am interested in MediReminder for my clinic."
              target="_blank"
              className="w-full sm:w-auto bg-white/40 backdrop-blur-xl border border-white/60 text-slate-700 px-10 py-5 rounded-[2rem] font-black text-xl shadow-sm hover:bg-white/60 transition-all flex items-center space-x-3"
            >
              <MessageCircle className="w-6 h-6 text-green-500" />
              <span>Connect on WhatsApp</span>
            </Link>
          </motion.div>

          {/* 3D Visual Section */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl h-[400px] md:h-[600px] flex justify-center items-center"
          >
             {/* Main Dashboard Mockup */}
             <div className="relative z-20 w-full h-full transform hover:scale-[1.02] transition-transform duration-700 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent rounded-[3rem] blur-2xl"></div>
                <div className="relative h-full border border-white/60 bg-white/30 backdrop-blur-3xl rounded-[3rem] shadow-2xl overflow-hidden p-3 group-hover:shadow-blue-500/10 transition-shadow">
                    <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden bg-slate-50 flex items-center justify-center">
                        {/* Placeholder for the generated dashboard image */}
                        <div className="text-slate-300 font-bold text-lg select-none">MediReminder Cloud Interface</div>
                        {/* Decorative UI elements */}
                        <div className="absolute top-10 left-10 w-48 h-32 bg-white rounded-3xl shadow-lg p-4 border border-slate-100 flex flex-col justify-between">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl"></div>
                            <div className="w-20 h-4 bg-slate-100 rounded-full"></div>
                        </div>
                        <div className="absolute bottom-10 right-10 w-48 h-32 bg-blue-600 rounded-3xl shadow-xl p-4 flex flex-col justify-between text-white">
                            <div className="w-10 h-10 bg-white/20 rounded-xl"></div>
                            <div className="w-20 h-4 bg-white/30 rounded-full"></div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Floating 3D Assets (Medicine Capsule Style) */}
             <motion.div 
               animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-10 -left-10 w-40 h-40 z-30 opacity-80"
             >
                <div className="w-full h-full bg-gradient-to-tr from-blue-400/40 to-white/60 rounded-full blur-[10px] border border-white/80 shadow-2xl backdrop-blur-lg"></div>
             </motion.div>
             
             <motion.div 
               animate={{ y: [0, 40, 0], rotate: [0, -20, 0] }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute top-1/2 -right-8 w-32 h-32 z-30 opacity-60"
             >
                <div className="w-full h-full bg-gradient-to-tr from-cyan-400/30 to-white/60 rounded-3xl blur-[8px] border border-white/80 shadow-2xl backdrop-blur-lg transform rotate-45"></div>
             </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default Hero
