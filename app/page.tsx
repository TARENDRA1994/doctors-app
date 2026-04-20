'use client'

import { useSession } from 'next-auth/react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Navbar from '@/components/marketing/Navbar'
import Hero from '@/components/marketing/Hero'
import Features from '@/components/marketing/Features'
import Footer from '@/components/marketing/Footer'
import WhatsAppButton from '@/components/marketing/WhatsAppButton'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <main className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[60]" style={{ scaleX }} />
      
      <Navbar />
      
      <Hero />

      {/* Futuristic Social Proof Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row items-center justify-between border-y border-slate-100 py-16 gap-12">
              <div className="max-w-xs">
                 <h4 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    State of the Art
                 </h4>
                 <p className="text-slate-400 font-medium">Powering the next generation of clinical excellence.</p>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                 <div className="text-3xl font-black text-slate-900 tracking-tighter italic">BIO.GEN</div>
                 <div className="text-3xl font-black text-slate-900 tracking-tighter italic">NEURO.CORE</div>
                 <div className="text-3xl font-black text-slate-900 tracking-tighter italic">VITA.LINK</div>
              </div>
           </div>
        </div>
      </section>

      <Features />

      {/* Premium CTA Section */}
      <section className="py-20 md:py-40 relative bg-white overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-blue-50/50 rounded-full blur-[120px]"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="p-12 md:p-24 rounded-[4rem] bg-gradient-to-br from-blue-600 to-blue-700 text-white text-center shadow-3xl relative overflow-hidden">
             {/* Decorative 3D-like spheres in background */}
             <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>

             <motion.h2 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="text-4xl md:text-7xl font-black mb-8 leading-tight tracking-tight"
             >
               The future of care starts <br />
               <span className="text-blue-200">here.</span>
             </motion.h2>
             
             <p className="text-xl text-blue-100 mb-12 max-w-xl mx-auto font-medium">
               Upgrade your practice today. Instant setup, zero friction, limitless potential.
             </p>
             
             <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
               <Link 
                 href="/register" 
                 className="w-full sm:w-auto bg-white text-blue-600 px-12 py-6 rounded-full font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
               >
                 Register Now
               </Link>
               {session ? (
                 <Link 
                   href="/dashboard" 
                   className="w-full sm:w-auto flex items-center justify-center space-x-3 text-white font-bold text-xl group"
                 >
                   <span>Admin Console</span>
                   <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                 </Link>
               ) : (
                 <Link 
                   href="/login" 
                   className="w-full sm:w-auto flex items-center justify-center space-x-3 text-white font-bold text-xl group"
                 >
                   <span>Login</span>
                   <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                 </Link>
               )}
             </div>
          </div>
        </div>
      </section>

      <Footer />
      
      <WhatsAppButton />
    </main>
  )
}