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
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled 
          ? 'py-4 bg-black/40 backdrop-blur-3xl border-b border-white/5' 
          : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:rotate-[360deg] transition-transform duration-1000">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              MediReminder <span className="text-cyan-400">OS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-12">
            {['Features', 'Intelligence', 'Security'].map((item) => (
              <Link 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-colors"
              >
                {item}
              </Link>
            ))}
            <Link 
              href="/login" 
              className="text-sm font-bold text-white uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-cyan-400 transition-all"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-white text-black px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-cyan-400 hover:text-black transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/5 p-8"
          >
            <div className="space-y-6">
              {['Features', 'Intelligence', 'Security', 'Login'].map((item) => (
                <Link 
                  key={item}
                  onClick={() => setIsMobileMenuOpen(false)}
                  href={`/${item.toLowerCase()}`} 
                  className="block text-2xl font-black text-white uppercase tracking-[0.1em]"
                >
                  {item}
                </Link>
              ))}
              <Link 
                onClick={() => setIsMobileMenuOpen(false)}
                href="/register" 
                className="flex items-center justify-between bg-cyan-500 text-black p-5 rounded-2xl font-black uppercase tracking-[0.1em]"
              >
                <span>Setup OS</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
