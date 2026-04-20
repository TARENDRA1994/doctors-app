'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, X, ArrowRight } from 'lucide-react'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl transition-all duration-500 rounded-full border ${
        isScrolled 
          ? 'py-3 bg-white/40 backdrop-blur-2xl border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)]' 
          : 'py-4 bg-white/20 backdrop-blur-md border-white/20 shadow-none'
      }`}
    >
      <div className="px-6 sm:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              MediReminder
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-900 p-2"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full mt-4 left-0 right-0 md:hidden bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden p-4"
          >
            <div className="space-y-2">
              <Link onClick={() => setIsMobileMenuOpen(false)} href="#features" className="block text-lg font-bold text-slate-900 p-4 rounded-2xl hover:bg-slate-50">Features</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/login" className="block text-lg font-bold text-slate-900 p-4 rounded-2xl hover:bg-slate-50">Login</Link>
              <Link 
                onClick={() => setIsMobileMenuOpen(false)}
                href="/register" 
                className="flex items-center justify-between bg-blue-600 text-white p-4 rounded-2xl font-bold mt-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
