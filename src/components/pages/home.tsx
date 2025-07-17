'use client'

import { useState } from 'react'
import { FloatingNavbar } from '@/components/layout/floating-navbar'
import { FloatingSidebar } from '@/components/layout/floating-sidebar'
import { FloatingInfoPanel } from '@/components/layout/floating-info-panel'
import { HeroSection } from '@/components/sections/hero-section'
import { BelowFoldSection } from '@/components/sections/below-fold-section'
import { homepageConfig } from '@/config/homepage'
import { useRouter } from 'next/navigation'

export function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-enostics-gray-950 text-gray-900 dark:text-white transition-colors duration-500">
      <div className="h-full w-full">
        <FloatingNavbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <FloatingSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <FloatingInfoPanel />
        
        {/* Hero Section */}
        <section id="hero">
          <HeroSection />
        </section>
        
        {/* Features Section */}
        <section id="features">
          <BelowFoldSection />
        </section>
      </div>
    </main>
  )
}

function FAQAccordion() {
  return (
    <section className="h-screen min-h-[100vh] flex items-center justify-center bg-gradient-to-b from-black via-enostics-gray-900 to-enostics-blue/80 snap-start" id="faq">
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-white drop-shadow text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {/* FAQ items */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">What is Enostics?</h3>
            <p className="text-white/80">Enostics is an enterprise-grade endpoint intelligence layer that gives every person, device, and service a programmable API endpoint. It enables real-time data processing, automation, and secure integration across your entire stack.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">How does it work?</h3>
            <p className="text-white/80">Each endpoint acts as a smart gateway that can ingest, process, and route data in real-time. You can connect any data source, apply custom logic, and integrate with your existing tools and services—all with enterprise-grade security and compliance.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Is it secure?</h3>
            <p className="text-white/80">Yes. Enostics is built with security-first principles: end-to-end encryption, role-based access control, audit logging, and compliance with major standards (SOC2, HIPAA, GDPR). Your data remains under your control at all times.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Can I try it for free?</h3>
            <p className="text-white/80">Yes! We offer a free tier for developers and startups. For enterprise customers, we provide custom demos and POCs tailored to your specific use cases. Contact our sales team to learn more.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 