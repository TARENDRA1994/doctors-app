'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, MessageCircle, Zap, ShieldCheck, Activity } from 'lucide-react'
import Link from 'next/link'

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Mouse tracking for 3D Tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const xPct = (mouseX / width) - 0.5
    const yPct = (mouseY / height) - 0.5
    
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-[#020617] perspective-1000"
    >
      {/* Dynamic Background Mesh */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px]"></div>
        {/* Scanned Grid Floor Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <motion.div 
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="flex flex-col items-center text-center"
        >
          
          {/* Futuristic Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full text-cyan-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-12 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>AI Augmented Medical OS</span>
          </motion.div>

          {/* 3D-feeling Typography */}
          <motion.div 
             className="relative mb-12 select-none"
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              REDEFINE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">HEALTHCARE.</span>
            </h1>
            {/* Soft Glow Shadow Text */}
            <div className="absolute top-0 left-0 right-0 -z-10 blur-3xl opacity-30 select-none">
                <h1 className="text-7xl md:text-9xl font-black text-blue-500 leading-[0.9] tracking-tighter">
                  REDEFINE <br />
                  HEALTHCARE.
                </h1>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="text-lg md:text-2xl text-slate-400 max-w-2xl mb-16 font-medium leading-relaxed"
          >
            Streamline your clinic with Zero-Touch WhatsApp automation and clinical-grade AI intelligence.
          </motion.p>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-24">
            <Link 
              href="/register" 
              className="group relative w-full sm:w-auto overflow-hidden bg-white text-black px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all"
            >
               <span className="relative z-10">INITIALIZE SYSTEM</span>
               <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
            <Link 
              href="https://wa.me/918878914647?text=Hi! I am looking for a professional 3D-enabled healthcare solution."
              target="_blank"
              className="w-full sm:w-auto bg-white/5 border border-white/10 backdrop-blur-xl text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-white/10 transition-all flex items-center justify-center space-x-3"
            >
              <MessageCircle className="w-6 h-6 text-cyan-400" />
              <span>DIRECT WHATSAPP</span>
            </Link>
          </div>

          {/* THE 3D SCENE (Centerpiece) */}
          <motion.div 
             style={{ translateZ: "100px" }}
             className="relative w-full max-w-5xl h-[400px] md:h-[600px] group mb-20"
          >
             {/* Main Hologram Container */}
             <div className="absolute inset-0 flex justify-center items-center">
                
                {/* Decorative Hologram Rings */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[300px] h-[300px] border-2 border-cyan-500/10 rounded-full"
                ></motion.div>
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[450px] h-[450px] border border-blue-500/5 rounded-full"
                ></motion.div>

                {/* 3D Holographic UI plates */}
                <motion.div 
                  initial={{ x: 0 }}
                  animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ translateZ: "150px" }}
                  className="absolute top-0 right-1/4 w-64 h-48 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
                >
                   <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg animate-pulse flex items-center justify-center">
                        <Activity className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="w-24 h-2 bg-white/10 rounded-full"></div>
                   </div>
                   <div className="space-y-3">
                      <div className="w-full h-1 bg-white/5 rounded-full"></div>
                      <div className="w-[80%] h-1 bg-white/5 rounded-full"></div>
                      <div className="w-[90%] h-1 bg-white/5 rounded-full"></div>
                   </div>
                   {/* Digital Noise Background */}
                   <div className="absolute inset-0 opacity-10 pointer-events-none select-none text-[8px] font-mono text-cyan-500 break-all p-2 overflow-hidden">
                      01010101101010101011010101111001010101011010101010110101011110010
                   </div>
                </motion.div>

                <motion.div 
                  initial={{ x: 0 }}
                  animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
                  transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                  style={{ translateZ: "200px" }}
                  className="absolute bottom-10 left-1/4 w-72 h-56 bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl"
                >
                   <div className="flex justify-between items-center mb-8">
                       <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <ShieldCheck className="w-6 h-6 text-blue-400" />
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Security Level</p>
                          <p className="text-xl font-black text-white">MAX-9</p>
                       </div>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: ["0%", "100%", "92%"] }}
                        transition={{ duration: 3 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      ></motion.div>
                   </div>
                </motion.div>

                {/* THE MAIN HOLOGRAM (Center Placeholder for Generated Image) */}
                <motion.div 
                  style={{ translateZ: "250px" }}
                  className="relative z-50 w-[400px] h-[400px] flex items-center justify-center pointer-events-none"
                >
                   <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
                   {/* This is where the stunning static 3D medical asset goes */}
                   <div className="text-white/20 font-black text-4xl tracking-widest animate-pulse border-2 border-white/5 px-10 py-20 rounded-[5rem] rotate-12">
                      SYSTEM CORE
                   </div>
                </motion.div>

             </div>

          </motion.div>

        </motion.div>
      </div>

      {/* Floating Interactive Bottom Stats */}
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 relative z-20">
         {[
           { label: "Precision", val: "99.9%" },
           { label: "Encryption", val: "AES-256" },
           { label: "Uptime", val: "99.99%" }
         ].map((stat) => (
           <div key={stat.label} className="text-center group cursor-crosshair">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-2 group-hover:text-cyan-400 transition-colors">{stat.label}</p>
              <p className="text-3xl font-black text-white tracking-tight">{stat.val}</p>
           </div>
         ))}
      </div>

    </section>
  )
}

export default Hero
