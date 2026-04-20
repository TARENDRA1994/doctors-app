'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                MediReminder
              </span>
            </Link>
            <p className="text-slate-500 mb-6 max-w-xs">
              Modernizing clinic-patient communication through intelligent automation and AI.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-teal-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-teal-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-teal-600 transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">Features</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">Pricing</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">Help Center</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">API Docs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">About Us</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">Careers</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 transition-colors font-medium">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Support</h4>
            <p className="text-slate-500 mb-4 font-medium">Ready to modernize your clinic?</p>
            <Link 
              href="https://wa.me/918878914647" 
              className="inline-flex items-center space-x-2 text-teal-600 font-bold border-b-2 border-teal-600 hover:text-teal-700 hover:border-teal-700 transition-all"
            >
              Contact Support on WhatsApp
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          <p>© 2026 MediReminder. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 font-medium">
            <Link href="#" className="hover:text-slate-600">Privacy</Link>
            <Link href="#" className="hover:text-slate-600">Cookies</Link>
            <Link href="#" className="hover:text-slate-600">License</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
