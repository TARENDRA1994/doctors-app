'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/918878914647?text=Hi! I am using the MediReminder 3D Interface. Can you help me with clinical integration?"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-12 right-12 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl text-cyan-400 p-6 rounded-3xl shadow-[0_20px_50px_rgba(34,211,238,0.2)] border border-white/10 group hover:bg-cyan-500 hover:text-black transition-all duration-500"
    >
      <div className="absolute -top-16 right-0 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] px-5 py-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none translate-y-2 group-hover:translate-y-0">
        System Support
        <div className="absolute top-full right-8 border-8 border-transparent border-t-white"></div>
      </div>
      
      {/* 3D Pulse Rings */}
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-cyan-500 rounded-3xl"
      ></motion.div>
      <motion.div
        animate={{ scale: [1, 2.2, 1], opacity: [0.1, 0, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute inset-0 bg-blue-500 rounded-3xl"
      ></motion.div>
      
      <MessageCircle size={32} className="relative z-10" fill="currentColor" />
    </motion.a>
  )
}

export default WhatsAppButton
