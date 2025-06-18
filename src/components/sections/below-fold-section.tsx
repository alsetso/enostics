'use client'

export function BelowFoldSection() {
  return (
    <section className="h-screen bg-enostics-gray-900 relative z-10 flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Feature 1 */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Instant Setup</h3>
            <p className="text-white/70 leading-relaxed">
              Get your personal API endpoint up and running in minutes. No complex configuration required.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Secure by Default</h3>
            <p className="text-white/70 leading-relaxed">
              Your data is encrypted and protected. You control who has access and how it's used.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Universal Connect</h3>
            <p className="text-white/70 leading-relaxed">
              Connect any device, app, or service to your endpoint. Built for interoperability.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of users building their personal data infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register">
              <button className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-semibold rounded-lg hover:scale-105 transition-all duration-200 shadow-lg">
                Get Started Free
              </button>
            </a>
            <a href="/docs">
              <button className="inline-flex items-center justify-center px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200">
                View Documentation
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
} 