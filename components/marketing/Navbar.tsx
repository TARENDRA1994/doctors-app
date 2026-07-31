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
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              SanjeevaniBharat
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">
              Features
            </Link>
            <Link href="/book" className="text-slate-600 hover:text-teal-600 font-bold transition-colors bg-teal-50 px-3 py-1.5 rounded-full">
              Book Appointment
            </Link>
            <Link href="/status" className="text-slate-600 hover:text-teal-600 font-bold transition-colors">
              Check Status
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
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
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link href="/#features" className="block text-lg font-medium text-slate-900 px-2 py-1">Features</Link>
              <Link href="/book" className="block text-lg font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">Book Appointment</Link>
              <Link href="/status" className="block text-lg font-bold text-slate-900 px-2 py-1">Check Status</Link>
              <hr className="border-slate-100" />
              <Link href="/login" className="block text-lg font-medium text-slate-900 px-2 py-1">Login</Link>
              <Link 
                href="/register" 
                className="flex items-center justify-between bg-teal-600 text-white px-4 py-3 rounded-xl font-bold"
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
