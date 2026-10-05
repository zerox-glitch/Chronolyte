import { motion } from 'framer-motion';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';

export function RefundPolicy() {
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
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 gradient-text">Refund Policy</h1>
            <p className="text-white/50 mb-8">Last updated: February 7, 2026</p>

            <div className="space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Overview</h2>
                <p className="mb-4">
                  At Chronolyte, we strive to deliver high-quality digital services that meet your expectations. 
                  This Refund Policy outlines the terms and conditions under which refunds may be issued for 
                  our services.
                </p>
                <p>
                  All payments are processed by <strong>Paddle.com Market Limited</strong> ("Paddle"), our 
                  Merchant of Record. Refund requests are handled through Paddle's refund system.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Digital Products and Services</h2>
                <p className="mb-4">
                  Due to the nature of digital products and services, refund eligibility varies depending 
                  on the type of purchase:
                </p>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">2.1 Software Subscriptions</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>You may request a refund within <strong>14 days</strong> of your initial purchase if you are not satisfied with the service</li>
                  <li>Refunds are typically not provided for subscription renewals; we recommend cancelling before your renewal date</li>
                  <li>To avoid future charges, cancel your subscription at least 24 hours before the renewal date</li>
                  <li>Partial refunds for unused portions of a billing period are not typically provided</li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">2.2 One-Time Purchases</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Digital products that have been downloaded or accessed are generally non-refundable</li>
                  <li>If you experience technical issues preventing access, contact us for support before requesting a refund</li>
                  <li>Refunds may be considered within <strong>14 days</strong> of purchase if the product is demonstrably not as described</li>
                </ul>

                <h3 className="text-xl font-semibold text-cyan-400 mb-3">2.3 Custom Development Services</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Custom projects are subject to the terms outlined in your individual service agreement</li>
                  <li>Deposits and milestone payments are generally non-refundable once work has commenced</li>
                  <li>Partial refunds may be considered based on the stage of project completion</li>
                  <li>Disputes regarding custom work will be resolved according to the project agreement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. How to Request a Refund</h2>
                <p className="mb-4">
                  Since Paddle handles all payment processing, refund requests should be submitted through 
                  one of the following methods:
                </p>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Contact Paddle directly:</strong> You can request a refund through your Paddle 
                    receipt email or by contacting Paddle's customer support
                  </li>
                  <li>
                    <strong>Contact Chronolyte:</strong> Email us at <span className="text-cyan-400">support@chronolyte.com</span> with 
                    your order details, and we will coordinate with Paddle on your behalf
                  </li>
                </ol>
                <p className="mt-4">
                  When requesting a refund, please provide:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Your order number or receipt number</li>
                  <li>The email address used for the purchase</li>
                  <li>A brief explanation of why you are requesting a refund</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Refund Processing</h2>
                <p className="mb-4">
                  Once a refund is approved:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Paddle will process the refund to your original payment method</li>
                  <li>Refunds typically take <strong>5-10 business days</strong> to appear in your account, depending on your payment provider</li>
                  <li>The refund amount will be in the original currency of purchase</li>
                  <li>Any applicable taxes collected will also be refunded</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Non-Refundable Situations</h2>
                <p className="mb-4">Refunds will generally not be provided in the following situations:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You changed your mind after accessing or downloading the product</li>
                  <li>You did not read the product description before purchasing</li>
                  <li>You found a similar product elsewhere at a lower price</li>
                  <li>Issues caused by your own hardware, software, or internet connection</li>
                  <li>Subscription renewals where cancellation was not requested before the renewal date</li>
                  <li>Violations of our Terms of Service resulting in account termination</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Chargebacks</h2>
                <p className="mb-4">
                  Before initiating a chargeback with your bank or credit card company, please contact 
                  us first. We are committed to resolving issues fairly and promptly.
                </p>
                <p>
                  Chargebacks initiated without attempting to resolve the issue with us may result in:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Suspension of your account and access to services</li>
                  <li>Collection efforts for disputed amounts if the chargeback is not upheld</li>
                  <li>Inability to make future purchases from Chronolyte</li>
                </ul>
                <p className="mt-4">
                  Paddle handles all chargeback disputes on our behalf.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. EU Consumer Rights</h2>
                <p className="mb-4">
                  If you are a consumer in the European Union, you have the right to withdraw from a 
                  purchase within 14 days without giving any reason (the "cooling-off period").
                </p>
                <p className="mb-4">
                  However, please note that for digital content:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    The withdrawal right expires once the performance of services has begun with your 
                    prior express consent and acknowledgment that you lose your right of withdrawal
                  </li>
                  <li>
                    For digital products, by accessing or downloading the content, you agree to waive 
                    your right of withdrawal
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Exceptions and Special Circumstances</h2>
                <p className="mb-4">
                  We understand that exceptional circumstances may arise. We evaluate refund requests 
                  on a case-by-case basis and may make exceptions for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Accidental duplicate purchases</li>
                  <li>Technical issues on our end that prevent service delivery</li>
                  <li>Billing errors or unauthorized transactions</li>
                  <li>Significant changes to service features after purchase</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
                <p className="mb-4">
                  If you have questions about this Refund Policy or need assistance with a refund request:
                </p>
                <p>
                  <strong className="text-cyan-400">Email:</strong> support@chronolyte.com<br />
                  <strong className="text-cyan-400">Website:</strong> https://chronolyte.com
                </p>
                <p className="mt-4">
                  For payment-specific inquiries, you may also contact Paddle directly through the 
                  link provided in your purchase receipt.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Policy Updates</h2>
                <p>
                  We reserve the right to modify this Refund Policy at any time. Changes will be 
                  effective immediately upon posting to this page. We encourage you to review this 
                  policy periodically. Purchases made before a policy change will be governed by 
                  the policy in effect at the time of purchase.
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
