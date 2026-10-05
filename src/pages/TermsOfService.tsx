import { motion } from 'framer-motion';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <SiteNavigation />

      {/* Content */}
      <main className="pt-24 pb-16 px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass rounded-3xl p-8 md:p-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 gradient-text">Terms of Service</h1>
            <p className="text-white/50 mb-8">Last updated: February 7, 2026</p>

            <div className="space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
                <p>
                  By accessing or using the services provided by Chronolyte ("we," "us," or "our") at 
                  <a href="https://chronolyte.com" className="text-cyan-400 hover:underline ml-1">https://chronolyte.com</a>, 
                  you agree to be bound by these Terms of Service. If you disagree with any part of these terms, 
                  you may not access our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Description of Services</h2>
                <p className="mb-4">Chronolyte provides the following digital services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Custom website design and development</li>
                  <li>SaaS (Software as a Service) product development</li>
                  <li>AI tools and automation solutions</li>
                  <li>Digital services and consulting</li>
                  <li>Subscription-based software services</li>
                </ul>
                <p className="mt-4">
                  We do not sell or ship physical products. All products and services are delivered digitally.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Payments and Billing</h2>
                <p className="mb-4">
                  All payments for Chronolyte services are processed by <strong>Paddle.com Market Limited</strong> 
                  ("Paddle"), our Merchant of Record. This means:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Paddle handles all payment processing, billing, and invoicing</li>
                  <li>Paddle collects and remits all applicable VAT, sales tax, and other transaction taxes</li>
                  <li>Paddle manages chargebacks, disputes, and payment-related customer service</li>
                  <li>Your payment information is processed securely by Paddle, not Chronolyte</li>
                </ul>
                <p className="mt-4">
                  By making a purchase, you also agree to Paddle's 
                  <a href="https://www.paddle.com/legal/terms" className="text-cyan-400 hover:underline ml-1" target="_blank" rel="noopener noreferrer">Terms of Use</a> and 
                  <a href="https://www.paddle.com/legal/privacy" className="text-cyan-400 hover:underline ml-1" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Subscriptions</h2>
                <p className="mb-4">Some of our services are offered on a subscription basis:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                  <li>You may cancel your subscription at any time through your account dashboard or by contacting Paddle</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>Paddle handles all subscription management and billing inquiries</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. User Responsibilities</h2>
                <p className="mb-4">When using our services, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Not use our services for any illegal or unauthorized purpose</li>
                  <li>Not attempt to reverse engineer, copy, or redistribute our software without permission</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                <p className="mb-4">
                  Unless otherwise specified in a separate agreement:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Chronolyte retains ownership of all proprietary software, tools, and frameworks</li>
                  <li>Upon full payment, clients receive a license to use the deliverables for their intended purpose</li>
                  <li>Custom work created specifically for a client may transfer ownership upon full payment, as specified in the project agreement</li>
                  <li>You may not resell or redistribute our software or services without explicit written permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                <p className="mb-4">
                  To the maximum extent permitted by applicable law:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Chronolyte shall not be liable for any indirect, incidental, special, consequential, 
                    or punitive damages, including loss of profits, data, or business opportunities
                  </li>
                  <li>
                    Our total liability for any claim arising from these terms or your use of our services 
                    shall not exceed the amount paid by you to Chronolyte in the twelve (12) months preceding the claim
                  </li>
                  <li>
                    We do not guarantee that our services will be uninterrupted, error-free, or completely secure
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
                <p>
                  Our services are provided "as is" and "as available" without warranties of any kind, 
                  either express or implied, including but not limited to implied warranties of merchantability, 
                  fitness for a particular purpose, and non-infringement. We do not warrant that our services 
                  will meet your specific requirements or expectations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your access to our services at any time, 
                  with or without cause, and with or without notice. Upon termination, your right to use 
                  our services will immediately cease. Provisions that by their nature should survive 
                  termination shall survive, including ownership provisions, warranty disclaimers, and 
                  limitations of liability.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with applicable laws. 
                  Any disputes arising from these terms or your use of our services shall be resolved 
                  through good-faith negotiation. If a resolution cannot be reached, disputes may be 
                  submitted to binding arbitration or the appropriate courts of jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of any 
                  material changes by updating the "Last updated" date at the top of this page. Your 
                  continued use of our services after such modifications constitutes your acceptance 
                  of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="mt-4">
                  <strong className="text-cyan-400">Email:</strong> legal@chronolyte.com<br />
                  <strong className="text-cyan-400">Website:</strong> https://chronolyte.com
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
