'use client'

export function HeroSection() {
  return (
    <section className="h-screen flex items-center justify-center relative z-10">
      <div className="text-center max-w-4xl px-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Connect anything to anyone.
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
          Enostics gives every person a programmable endpoint for the digital nation — live and private.
        </p>
        <div className="flex justify-center">
          <a href="/register">
            <button className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white text-lg font-semibold rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              Create Account
            </button>
          </a>
        </div>
      </div>
    </section>
  )
} 