'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, CheckCircle2, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Decorative background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full text-teal-700 font-semibold text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span>v2.0 Now Live - AI Powered Nutrition Assistant</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Modern Clinic Care, <br />
              <span className="text-teal-600">Automated.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
              Empower your practice with automated WhatsApp reminders, patient tracking, and AI-driven nutrition management. Built for professional doctors who value time.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-teal-600/20 hover:shadow-2xl hover:shadow-teal-600/30 transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-1"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="https://wa.me/918878914647?text=Hi! I saw MediReminder and I want a live demo for my clinic."
                target="_blank"
                className="w-full sm:w-auto bg-white border-2 border-slate-100 hover:border-teal-100 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-teal-50 transition-all flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5 text-teal-600" />
                <span>Talk to Support</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-slate-500 font-medium">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                <span>Zero Setup Fee</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 font-medium">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative mt-12 lg:mt-0"
          >
            <div className="relative group">
              {/* Glass dashboard mockup placeholder */}
              <div className="bg-gradient-to-br from-white to-teal-50/30 border border-white p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(13,148,136,0.1)] backdrop-blur-sm overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-500">
                <div className="bg-slate-50 w-full h-[400px] rounded-[1.5rem] relative overflow-hidden">
                  {/* Decorative Dashboard Elements */}
                  <div className="absolute top-6 left-6 right-6 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center px-4 justify-between">
                     <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                     </div>
                     <div className="w-32 h-3 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 p-6 mt-16">
                     <div className="h-32 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg mb-4"></div>
                        <div className="w-20 h-3 bg-slate-100 rounded-full"></div>
                     </div>
                     <div className="h-32 bg-teal-600 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                        <div className="w-16 h-3 bg-white/30 rounded-full"></div>
                     </div>
                  </div>
                  <div className="p-6">
                    <div className="h-40 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                        <div className="flex justify-between items-center mb-6">
                           <div className="w-32 h-4 bg-slate-100 rounded-full"></div>
                           <div className="w-12 h-6 bg-teal-50 rounded-full"></div>
                        </div>
                        <div className="space-y-4">
                           <div className="w-full h-3 bg-slate-50 rounded-full"></div>
                           <div className="w-[80%] h-3 bg-slate-50 rounded-full"></div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Stat Widget */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-teal-50 z-20 hidden xl:block"
              >
                 <p className="text-sm font-semibold text-slate-400 mb-1">Weekly Growth</p>
                 <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-slate-900">+42%</span>
                    <span className="text-emerald-500 font-bold">↑</span>
                 </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default Hero
