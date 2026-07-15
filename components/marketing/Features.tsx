'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BellRing, 
  BrainCircuit, 
  Users, 
  Calendar, 
  History, 
  FileCheck2,
  ListOrdered,
  Star,
  MessageSquareText,
  Receipt,
  TrendingUp,
  ShieldCheck
} from 'lucide-react'

const features = [
  {
    title: 'Automated Reminders',
    description: 'Stop chasing patients. Our system automatically sends WhatsApp reminders for medicines and appointments.',
    icon: BellRing,
    color: 'teal'
  },
  {
    title: 'AI Nutrition Assistant',
    description: 'Using Google Gemini 1.5 Pro to generate clinical diet plans tailored to your patients vitals.',
    icon: BrainCircuit,
    color: 'teal'
  },
  {
    title: 'Live OPD Queue',
    description: 'Manage clinic crowd seamlessly with real-time token tracking and wait time estimates on TV screens.',
    icon: ListOrdered,
    color: 'teal'
  },
  {
    title: 'Automated Google Reviews',
    description: 'Skyrocket your clinic ratings by automatically asking happy, cured patients to leave a 5-star review.',
    icon: Star,
    color: 'teal'
  },
  {
    title: 'AI Clinical Chatbot',
    description: 'Chat securely with your own clinical data. Get instant patient summaries and medical history analysis.',
    icon: MessageSquareText,
    color: 'teal'
  },
  {
    title: 'Patient Directory',
    description: 'Complete digital history of your patients, their prescriptions, and feedback in one secure place.',
    icon: Users,
    color: 'teal'
  },
  {
    title: 'Smart Scheduling',
    description: 'Elegant calendar management to avoid overlaps and ensure your clinic runs at peak efficiency.',
    icon: Calendar,
    color: 'teal'
  },
  {
    title: 'Feedback Loop',
    description: 'Get real-time updates from patients about how their medications are working.',
    icon: History,
    color: 'teal'
  },
  {
    title: 'Professional PDFs',
    description: 'Generate and send beautiful, professional prescriptions directly to patient phones via WhatsApp.',
    icon: FileCheck2,
    color: 'teal'
  },
  {
    title: 'Instant Billing',
    description: 'Create and send digital invoices and receipts to patients in seconds to simplify clinic accounting.',
    icon: Receipt,
    color: 'teal'
  },
  {
    title: 'Revenue Analytics',
    description: 'Track your clinic growth, daily footfall, and financial health with beautiful, easy-to-read charts.',
    icon: TrendingUp,
    color: 'teal'
  },
  {
    title: 'Role-Based Security',
    description: 'Give your receptionist access to manage appointments without exposing your clinic revenue and data.',
    icon: ShieldCheck,
    color: 'teal'
  }
]

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-50/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-teal-600 font-bold tracking-wider uppercase text-sm mb-3"
          >
            Capabilities
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight"
          >
            Everything you need to <br />
            <span className="text-slate-500">modernize your clinic.</span>
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-600/5 transition-all group"
            >
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:rotate-12 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
