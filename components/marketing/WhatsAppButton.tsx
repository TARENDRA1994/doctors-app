'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/918878914647?text=Hi! I saw MediReminder and I would like to know more about it for my clinic."
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] flex items-center justify-center bg-[#25D366] text-white p-4 rounded-full shadow-2xl group transition-transform duration-300"
    >
      <div className="absolute -top-12 right-0 bg-white text-slate-900 text-sm font-bold px-4 py-2 rounded-xl shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Chat with Support
        <div className="absolute top-full right-5 border-8 border-transparent border-t-white"></div>
      </div>
      
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-[#25D366] rounded-full opacity-30"
      ></motion.div>
      
      <MessageCircle size={32} className="relative z-10" fill="currentColor" />
    </motion.a>
  )
}

export default WhatsAppButton
