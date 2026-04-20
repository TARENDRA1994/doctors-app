'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BellRing, 
  BrainCircuit, 
  Users, 
  Calendar, 
  History, 
  FileCheck2 
} from 'lucide-react'

const features = [
  {
    title: 'Holographic Reminders',
    description: 'Precision automated WhatsApp flows for medicine and appointments.',
    icon: BellRing,
    color: 'cyan'
  },
  {
    title: 'Generative AI Diagnostics',
    description: 'Clinical grade nutrition and diet generation using Gemini 1.5 Pro.',
    icon: BrainCircuit,
    color: 'blue'
  },
  {
    title: 'Biometric Directory',
    description: 'A unified, secure database of every patient interaction and metric.',
    icon: Users,
    color: 'indigo'
  },
  {
    title: 'Flux Scheduling',
    description: 'Dynamic calendar management with zero-overlap algorithms.',
    icon: Calendar,
    color: 'cyan'
  },
  {
    title: 'Feedback Loopback',
    description: 'Real-time patient adherence and medicine efficiency tracking.',
    icon: History,
    color: 'blue'
  },
  {
    title: 'Crypto-Prescriptions',
    description: 'Immutable PDF exports with clinical security protocols.',
    icon: FileCheck2,
    color: 'indigo'
  }
]

const Features = () => {
  return (
    <section id="features" className="py-40 bg-[#020617] relative overflow-hidden">
      {/* Decorative Grid and Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.05)_0%,transparent_50%)]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-cyan-500 font-black tracking-[0.5em] uppercase text-xs mb-6"
          >
            Core Modules
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter"
          >
            Engineered for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Peak Performance.</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -15, 
                rotateX: 5, 
                rotateY: 5,
                transition: { duration: 0.3 } 
              }}
              className="relative p-12 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.06] hover:border-white/10 transition-all flex flex-col items-center text-center group perspective-1000"
            >
              {/* Card Glow */}
              <div className="absolute inset-0 bg-blue-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
              
              <div className={`w-20 h-20 bg-gradient-to-tr ${
                feature.color === 'cyan' ? 'from-cyan-500' : 
                feature.color === 'blue' ? 'from-blue-600' : 'from-indigo-600'
              } to-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-all duration-500`}>
                <feature.icon className="w-9 h-9 text-white" />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {feature.description}
              </p>

              {/* Floating Stat Indicator */}
              <div className="absolute top-6 right-6 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-all">
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Active</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
