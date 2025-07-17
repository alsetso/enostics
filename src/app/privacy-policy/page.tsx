import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-enostics-gray-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center text-enostics-green hover:text-enostics-green/80 transition-colors duration-200 mb-8">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-enostics-gray-400">
            Last updated: January 15, 2025
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className="bg-enostics-gray-900/50 backdrop-blur-sm rounded-2xl border border-enostics-gray-800 p-8 shadow-2xl">
          <div className="prose prose-lg prose-invert max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                Enostics, Inc. ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our universal personal API layer platform ("Service").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">2.1 Personal Information</h3>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2 mb-4">
                <li>• Account information (username, email address, password)</li>
                <li>• Profile information (display name, preferences)</li>
                <li>• Billing information (payment details, subscription data)</li>
                <li>• Communication data (support tickets, feedback)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">2.2 API and Usage Data</h3>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2 mb-4">
                <li>• API requests and responses through your personal endpoints</li>
                <li>• Usage statistics and analytics</li>
                <li>• Error logs and performance metrics</li>
                <li>• Device and browser information</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">2.3 Data Through Your Endpoints</h3>
              <p className="text-enostics-gray-300 leading-relaxed">
                Data sent to your personal API endpoints by external services, devices, or applications. 
                This data belongs to you and is processed according to your configurations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• To provide and maintain the Service</li>
                <li>• To process your API requests and manage your endpoints</li>
                <li>• To communicate with you about your account and service updates</li>
                <li>• To improve our Service and develop new features</li>
                <li>• To ensure security and prevent fraud</li>
                <li>• To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Ownership and Control</h2>
              <p className="text-enostics-gray-300 leading-relaxed mb-4">
                <strong>You own your data.</strong> All data sent to your personal API endpoints remains your property. 
                We act only as a processor of your data and do not claim ownership over it.
              </p>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• You control who can access your endpoints</li>
                <li>• You can configure data retention and deletion policies</li>
                <li>• You can export your data at any time</li>
                <li>• You can delete your account and associated data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-enostics-gray-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• With your explicit consent</li>
                <li>• To comply with legal requirements or court orders</li>
                <li>• To protect our rights, property, or safety</li>
                <li>• With service providers who assist in operating our Service (under strict confidentiality)</li>
                <li>• In connection with a business transaction (merger, acquisition, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
              <p className="text-enostics-gray-300 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• Encryption in transit and at rest</li>
                <li>• Secure API key management</li>
                <li>• Regular security audits and monitoring</li>
                <li>• Access controls and authentication</li>
                <li>• Incident response procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                We retain your personal information only for as long as necessary to provide the Service and comply with legal obligations. 
                Data sent to your personal endpoints is retained according to your configured retention policies. 
                You can request data deletion at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. International Data Transfers</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Your Rights</h2>
              <p className="text-enostics-gray-300 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• Right to access your personal information</li>
                <li>• Right to rectify inaccurate information</li>
                <li>• Right to erase your personal information</li>
                <li>• Right to restrict processing</li>
                <li>• Right to data portability</li>
                <li>• Right to object to processing</li>
                <li>• Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Cookies and Tracking</h2>
              <p className="text-enostics-gray-300 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• Essential cookies for Service functionality</li>
                <li>• Analytics cookies to improve our Service</li>
                <li>• Preference cookies to remember your settings</li>
              </ul>
              <p className="text-enostics-gray-300 leading-relaxed mt-4">
                You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Children's Privacy</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. 
                If we become aware that we have collected personal information from a child under 13, we will take steps to remove that information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on our website. 
                Your continued use of the Service after such changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-enostics-gray-800/50 rounded-lg">
                <p className="text-enostics-gray-300">
                  Email: privacy@enostics.com<br />
                  Data Protection Officer: dpo@enostics.com<br />
                  Address: Enostics, Inc.<br />
                  [Company Address]
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
} 