import Link from 'next/link'

export default function TermsOfUsePage() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Use</h1>
          <p className="text-enostics-gray-400">
            Last updated: January 15, 2025
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-enostics-gray-900/50 backdrop-blur-sm rounded-2xl border border-enostics-gray-800 p-8 shadow-2xl">
          <div className="prose prose-lg prose-invert max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                By accessing or using the Enostics platform ("Service"), you agree to be bound by these Terms of Use ("Terms"). 
                If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                Enostics provides a universal personal API layer that allows users to create, manage, and control their own intelligent 
                endpoints. The Service enables users to receive, process, and manage data from various sources through their personal API endpoints.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• You must provide accurate and complete information when creating an account</li>
                <li>• You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>• You must immediately notify us of any unauthorized use of your account</li>
                <li>• You may only create one account per person</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. API Usage and Limitations</h2>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• API usage is subject to rate limits based on your subscription plan</li>
                <li>• You may not use the API to violate any laws or regulations</li>
                <li>• You may not attempt to circumvent usage limits or security measures</li>
                <li>• We reserve the right to suspend or terminate API access for violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Ownership and Privacy</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                You retain ownership of all data you submit to or receive through your personal API endpoints. 
                We do not claim ownership of your data and will only use it as necessary to provide the Service. 
                Please refer to our Privacy Policy for detailed information about data handling practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Uses</h2>
              <p className="text-enostics-gray-300 leading-relaxed mb-4">You may not use the Service to:</p>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• Engage in illegal activities or violate any applicable laws</li>
                <li>• Transmit harmful, fraudulent, or malicious content</li>
                <li>• Interfere with or disrupt the Service or its infrastructure</li>
                <li>• Attempt to gain unauthorized access to other users' accounts or data</li>
                <li>• Use the Service for spam, phishing, or other abusive practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Subscription and Billing</h2>
              <ul className="text-enostics-gray-300 leading-relaxed space-y-2">
                <li>• Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>• All fees are non-refundable unless otherwise stated</li>
                <li>• We may change subscription prices with 30 days advance notice</li>
                <li>• Failure to pay fees may result in service suspension or termination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                Either party may terminate these Terms at any time. Upon termination, your access to the Service will cease, 
                and we may delete your account and associated data according to our data retention policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimers</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service will be 
                uninterrupted, error-free, or secure. Your use of the Service is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                To the maximum extent permitted by law, Enostics shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes by 
                posting the updated Terms on our website. Your continued use of the Service after such changes constitutes 
                acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
              <p className="text-enostics-gray-300 leading-relaxed">
                If you have any questions about these Terms of Use, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-enostics-gray-800/50 rounded-lg">
                <p className="text-enostics-gray-300">
                  Email: legal@enostics.com<br />
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