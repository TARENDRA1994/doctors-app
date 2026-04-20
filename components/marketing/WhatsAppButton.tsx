'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/918878914647?text=Hi! I am interested in MediReminder for my clinic."
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-10 right-10 z-[100] flex items-center justify-center bg-white text-[#25D366] p-5 rounded-full shadow-[0_20px_50px_rgba(37,211,102,0.2)] border border-slate-50 group hover:bg-[#25D366] hover:text-white transition-all duration-500"
    >
      <div className="absolute -top-14 right-0 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Connect on WhatsApp
        <div className="absolute top-full right-6 border-8 border-transparent border-t-slate-900"></div>
      </div>
      
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-[#25D366] rounded-full"
      ></motion.div>
      
      <MessageCircle size={30} className="relative z-10" fill="currentColor" />
    </motion.a>
  )
}

export default WhatsAppButton
