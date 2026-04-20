'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, Mail, MessageCircle } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              MediReminder
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-24 mb-20 text-blue-900/60 font-bold uppercase tracking-widest text-[10px]">
             <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
             <Link href="/login" className="hover:text-blue-600 transition-colors">Login</Link>
             <Link href="/register" className="hover:text-blue-600 transition-colors">Register</Link>
             <Link href="https://wa.me/918878914647" className="hover:text-blue-600 transition-colors">Support</Link>
          </div>

          <div className="w-full max-w-lg p-10 rounded-[3rem] bg-blue-50/50 border border-blue-100 mb-20">
             <h4 className="text-xl font-bold text-slate-900 mb-4">Questions? We are here.</h4>
             <p className="text-slate-500 mb-8">Get in touch with our team directly on WhatsApp for clinical integration support.</p>
             <Link 
              href="https://wa.me/918878914647" 
              className="inline-flex items-center space-x-3 bg-white text-blue-600 px-8 py-4 rounded-full font-bold shadow-sm hover:shadow-md transition-all"
             >
                <MessageCircle size={20} className="text-green-500 fill-current" />
                <span>Connect on WhatsApp</span>
             </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center w-full pt-12 border-t border-slate-50 text-slate-400 text-xs font-medium">
             <p>© 2026 MediReminder Cloud. Built for Professional Care.</p>
             <div className="flex space-x-8 mt-6 md:mt-0">
                <Link href="#" className="hover:text-slate-600">Privacy Policy</Link>
                <Link href="#" className="hover:text-slate-600">Terms of Service</Link>
                <Link href="#" className="hover:text-slate-600">Security</Link>
             </div>
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer
