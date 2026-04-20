'use client'

import { useSession } from 'next-auth/react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Navbar from '@/components/marketing/Navbar'
import Hero from '@/components/marketing/Hero'
import Features from '@/components/marketing/Features'
import Footer from '@/components/marketing/Footer'
import WhatsAppButton from '@/components/marketing/WhatsAppButton'
import Link from 'next/link'
import { ArrowRight, Sparkles, Binary, Terminal } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Advanced perspective scroll effect
  const yRange = useTransform(scrollYProgress, [0.8, 1], [0, -100])
  const rotateRange = useTransform(scrollYProgress, [0.8, 1], [0, 5])

  return (
    <main className="min-h-screen bg-[#020617] selection:bg-cyan-500 selection:text-black scroll-smooth">
      {/* 3D Global Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 origin-left z-[100] shadow-[0_0_20px_rgba(34,211,238,0.5)]" 
        style={{ scaleX }} 
      />
      
      <Navbar />
      
      <Hero />

      {/* 3D Social Proof / Clinical Nodes */}
      <section className="py-32 bg-[#020617] relative overflow-hidden border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row items-center justify-between py-20 gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="max-w-sm"
              >
                 <h4 className="text-sm font-black text-white mb-6 flex items-center gap-4 tracking-[0.4em]">
                    <Terminal className="w-5 h-5 text-cyan-400" />
                    SYSTEM NODES
                 </h4>
                 <p className="text-slate-500 font-bold text-lg leading-relaxed">Active surgical clusters and clinical environments integrated into the MediReminder neural network.</p>
              </motion.div>
              
              <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-40">
                 {[
                   { name: "CLINIC.X", icon: Sparkles },
                   { name: "NEURO.LAB", icon: Binary },
                   { name: "SURGI.CO", icon: Sparkles },
                   { name: "VITA.PULSE", icon: Binary }
                 ].map((node) => (
                    <motion.div 
                      key={node.name}
                      whileHover={{ scale: 1.1, opacity: 1 }}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                       <node.icon className="w-5 h-5 text-cyan-500 group-hover:animate-spin" />
                       <span className="text-2xl font-black text-white tracking-widest italic">{node.name}</span>
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      <Features />

      {/* 3D Immersive CTA */}
      <motion.section 
        style={{ y: yRange, rotateX: rotateRange }}
        className="py-40 relative bg-[#020617] overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-blue-900/10 rounded-full blur-[150px]"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="p-16 md:p-32 rounded-[4rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white text-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group border border-white/10">
             {/* Animating Light Rays */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.1),transparent_70%)] animate-pulse"></div>
             
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
                <h2 className="text-5xl md:text-8xl font-black mb-10 leading-none tracking-tighter">
                  JOIN THE <br />
                  <span className="text-cyan-400">REVOLUTION.</span>
                </h2>
                
                <p className="text-xl md:text-2xl text-blue-100/70 mb-16 max-w-2xl mx-auto font-bold uppercase tracking-widest">
                  Secure your practice nodes in the <br /> global medical operating system.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-12">
                  <Link 
                    href="/register" 
                    className="w-full sm:w-auto bg-white text-black px-14 py-7 rounded-2xl font-black text-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    DEPLOY NOW
                  </Link>
                  {session ? (
                    <Link 
                      href="/dashboard" 
                      className="w-full sm:w-auto flex items-center justify-center space-x-4 text-white font-black text-xl uppercase tracking-[0.2em] group"
                    >
                      <span>TERMINAL</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                    </Link>
                  ) : (
                    <Link 
                      href="/login" 
                      className="w-full sm:w-auto flex items-center justify-center space-x-4 text-white font-black text-xl uppercase tracking-[0.2em] group"
                    >
                      <span>ACCESS</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                    </Link>
                  )}
                </div>
             </motion.div>
          </div>
        </div>
      </motion.section>

      <Footer />
      
      <WhatsAppButton />
    </main>
  )
}