import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-dark-900/70 border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display font-bold text-xl text-white">CHRONOLYTE</span>
          </Link>
          <Link 
            to="/"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-sm font-semibold text-black hover:shadow-lg hover:shadow-cyan-500/30 transition-shadow"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16 px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass rounded-3xl p-8 md:p-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 gradient-text">Privacy Policy</h1>
            <p className="text-white/50 mb-8">Last updated: February 7, 2026</p>

            <div className="space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p className="mb-4">
                  Chronolyte ("we," "us," or "our") respects your privacy and is committed to protecting 
                  your personal data. This Privacy Policy explains how we collect, use, disclose, and 
                  safeguard your information when you visit our website 
                  <a href="https://chronolyte.com" className="text-cyan-400 hover:underline ml-1">https://chronolyte.com</a> 
                  or use our services.
                </p>
                <p>
                  This policy applies to all users worldwide and is designed to comply with the 
                  General Data Protection Regulation (GDPR) and other applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-cyan-400 mb-3">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Business information (company name, job title)</li>
                  <li>Communication data (messages, feedback, support requests)</li>
                  <li>Project requirements and specifications</li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">2.2 Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, click patterns)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log data (access times, referring URLs)</li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">2.3 Payment Information</h3>
                <p>
                  We do not directly collect or store your payment card details. All payment processing 
                  is handled by our Merchant of Record, <strong>Paddle.com Market Limited</strong> ("Paddle"). 
                  When you make a purchase, Paddle collects and processes your payment information according 
                  to their privacy policy. Please review 
                  <a href="https://www.paddle.com/legal/privacy" className="text-cyan-400 hover:underline ml-1" target="_blank" rel="noopener noreferrer">Paddle's Privacy Policy</a> 
                  for details on how they handle your data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Detect, prevent, and address technical issues and fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Legal Basis for Processing (GDPR)</h2>
                <p className="mb-4">Under the GDPR, we process your personal data based on the following legal grounds:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contract:</strong> Processing necessary for the performance of a contract with you</li>
                  <li><strong>Consent:</strong> Where you have given explicit consent for specific purposes</li>
                  <li><strong>Legitimate Interests:</strong> Where processing is necessary for our legitimate business interests</li>
                  <li><strong>Legal Obligation:</strong> Where processing is required to comply with applicable laws</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Service Providers</h2>
                <p className="mb-4">We share your information with the following categories of third parties:</p>
                
                <h3 className="text-xl font-semibold text-cyan-400 mb-3">5.1 Payment Processing</h3>
                <p className="mb-4">
                  <strong>Paddle.com Market Limited</strong> serves as our Merchant of Record and processes 
                  all payments, billing, VAT/sales tax collection, chargebacks, and refunds on our behalf.
                </p>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">5.2 Analytics Providers</h3>
                <p className="mb-4">
                  We use analytics services to understand how users interact with our website and services.
                </p>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">5.3 Hosting and Infrastructure</h3>
                <p>
                  We use cloud service providers to host our website and store data securely.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
                <p className="mb-4">
                  We retain your personal data only for as long as necessary to fulfill the purposes 
                  outlined in this Privacy Policy, unless a longer retention period is required or 
                  permitted by law. Criteria used to determine retention periods include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The duration of our ongoing relationship with you</li>
                  <li>Legal obligations requiring us to retain data</li>
                  <li>Statute of limitations for potential legal claims</li>
                  <li>Business needs and record-keeping purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights (GDPR)</h2>
                <p className="mb-4">Under the GDPR, you have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                  <li><strong>Right to Restrict Processing:</strong> Request limitation of how we use your data</li>
                  <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us at privacy@chronolyte.com.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your 
                  country of residence. These countries may have data protection laws that are different 
                  from the laws of your country. We ensure appropriate safeguards are in place to protect 
                  your personal data in accordance with this Privacy Policy and applicable law, including 
                  Standard Contractual Clauses approved by the European Commission where required.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Cookies and Tracking Technologies</h2>
                <p className="mb-4">
                  We use cookies and similar technologies to enhance your experience on our website. 
                  Types of cookies we use include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential Cookies:</strong> Necessary for the website to function properly</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing Cookies:</strong> Track your activity for advertising purposes (with consent)</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings. Note that disabling certain 
                  cookies may affect the functionality of our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal 
                  data against unauthorized access, alteration, disclosure, or destruction. However, no 
                  method of transmission over the Internet or electronic storage is 100% secure. While 
                  we strive to protect your personal data, we cannot guarantee its absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Children's Privacy</h2>
                <p>
                  Our services are not directed to individuals under the age of 16. We do not knowingly 
                  collect personal data from children. If you become aware that a child has provided us 
                  with personal data, please contact us, and we will take steps to delete such information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                  We encourage you to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy or wish to exercise your data 
                  protection rights, please contact us:
                </p>
                <p>
                  <strong className="text-cyan-400">Email:</strong> privacy@chronolyte.com<br />
                  <strong className="text-cyan-400">Website:</strong> https://chronolyte.com
                </p>
                <p className="mt-4">
                  You also have the right to lodge a complaint with a supervisory authority if you 
                  believe your data protection rights have been violated.
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
