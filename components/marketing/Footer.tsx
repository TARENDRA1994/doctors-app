'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, MessageCircle } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-32 pb-16 relative overflow-hidden">
      {/* Background Decorative Mesh */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-blue-900/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          <div className="flex items-center space-x-4 mb-20">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <Shield className="w-7 h-7 text-black" />
            </div>
            <span className="text-3xl font-black text-white tracking-widest uppercase">
              MediReminder
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-32 mb-32">
             {['Core', 'Intelligence', 'Protocol', 'Terminal'].map((title) => (
                <div key={title} className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-8">{title}</h4>
                   <ul className="space-y-4">
                      {['Module A', 'Module B', 'Module C'].map((link) => (
                        <li key={link}>
                          <Link href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{link}</Link>
                        </li>
                      ))}
                   </ul>
                </div>
             ))}
          </div>

          <div className="w-full max-w-2xl p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl mb-32 relative group overflow-hidden">
             <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <h4 className="text-3xl font-black text-white mb-6">Initialize Communication.</h4>
             <p className="text-slate-500 mb-10 text-lg font-medium">Direct secure channel to surgical integration and medical support.</p>
             <Link 
              href="https://wa.me/918878914647" 
              className="inline-flex items-center space-x-4 bg-cyan-500 text-black px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)]"
             >
                <MessageCircle size={24} fill="currentColor" />
                <span>WHATSAPP CHANNEL</span>
             </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center w-full pt-16 border-t border-white/5 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
             <p>© 2026 MediReminder OS. Global Security Standards Apply.</p>
             <div className="flex space-x-10 mt-8 md:mt-0">
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Legal</Link>
                <Link href="#" className="hover:text-white transition-colors">Nodes</Link>
             </div>
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer
