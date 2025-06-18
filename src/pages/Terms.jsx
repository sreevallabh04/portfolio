import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to section based on hash in URL
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-red-900 py-8 px-4 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Legal Information
          </h1>
          <p className="text-xl text-gray-300 mt-4">
            Terms, Policies, and Legal Guidelines
          </p>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => scrollToSection('terms-conditions')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => scrollToSection('refund-policy')}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
            >
              Refund Policy
            </button>
            <button
              onClick={() => scrollToSection('shipping-policy')}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
            >
              Shipping Policy
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="space-y-12">
          
          {/* Terms & Conditions */}
          <motion.section
            id="terms-conditions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 scroll-mt-20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-red-500">Terms & Conditions</h2>
              <button
                onClick={() => navigator.clipboard.writeText(`https://streamvallabh.life/terms#terms-conditions`)}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Copy Link
              </button>
            </div>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                By accessing this webpage, you are agreeing to be bound by these Terms and Conditions ("Terms") in a legally binding agreement between us ("Merchant" or "us" or "we" or "our") and the User ("you" or "your"). Please read these Terms carefully before accessing or using the Website. If you do not agree to the Terms, you may not access the Platform.
              </p>
              
              <p>
                We reserve the right to update and change the Terms and Conditions by posting updates and changes to the Platform. You are advised to check the Terms and Conditions from time to time for any updates or changes that may impact you.
              </p>

              <h3 className="text-xl font-bold text-red-400 mt-8">ELIGIBILITY</h3>
              <p>
                You hereby represent and warrant that you have the right, power, and authority to agree to the Terms, to become a party to a legally binding agreement and to perform your obligations here under.
              </p>

              <h3 className="text-xl font-bold text-red-400 mt-8">DEFINITIONS</h3>
              <div className="space-y-3">
                <p>
                  <strong>"Payment Instrument"</strong> includes credit card, debit card, bank account, prepaid payment instrument, Unified Payment Interface (UPI), Immediate Payment Service (IMPS) or any other methods of payments.
                </p>
                <p>
                  <strong>"Platform"</strong> refers to the website or platform where the Merchant offers its products or services and where the Transaction may be initiated.
                </p>
                <p>
                  <strong>"Transaction"</strong> shall refer to the order or request placed by the User with the Merchant to purchase the products and/or services listed on the Platform.
                </p>
              </div>

              <h3 className="text-xl font-bold text-red-400 mt-8">MERCHANT'S RIGHTS</h3>
              <p>
                You agree that we may collect, store, and share the information provided by you in order to deliver the products and/or services availed by you on our Platform and/or contact you in relation to the same.
              </p>

              <h3 className="text-xl font-bold text-red-400 mt-8">YOUR RESPONSIBILITIES</h3>
              <p>
                You agree to provide us with true, complete and up-to-date information about yourself as may be required for the purpose of completing the Transactions. This information includes personal details such as name, email address, phone number, delivery address, age, and gender as well as accurate payment information.
              </p>

              <h3 className="text-xl font-bold text-red-400 mt-8">PROHIBITED ACTIONS</h3>
              <p>You may not access or use the Platform for any purpose other than that for which we make it available. As a User, you agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Systematically retrieve data or content from the Platform without written permission</li>
                <li>Make unauthorized use of the Platform or collect user information</li>
                <li>Circumvent or interfere with security-related features</li>
                <li>Trick, defraud, or mislead us and other users</li>
                <li>Engage in automated use of the system or data mining</li>
                <li>Attempt to impersonate another user</li>
                <li>Use the Platform for unauthorized commercial purposes</li>
              </ul>

              <h3 className="text-xl font-bold text-red-400 mt-8">LIMITATION OF LIABILITY</h3>
              <p>
                The User agrees that the only recourse in the event of receiving a defective product and/or deficiency in service is to initiate the refund process. We expressly disclaim any liability for losses. The User shall indemnify and hold harmless the Merchant from any claims arising from breach of terms.
              </p>

              <h3 className="text-xl font-bold text-red-400 mt-8">GOVERNING LAWS & DISPUTE RESOLUTION</h3>
              <p>
                These terms are governed by the laws of India. Any dispute shall be referred to and resolved by arbitration in Bengaluru in accordance with the Arbitration and Conciliation Act, 1996. The decision of the arbitrator shall be final and binding.
              </p>

              <h3 className="text-xl font-bold text-red-400 mt-8">DISCLAIMER</h3>
              <p>
                Upon initiating a Transaction, you are entering into a legally binding contract with us. We expressly disclaim all liabilities that may arise from unauthorized use of Payment Instruments. All payments are subject to your own risk and volition.
              </p>
            </div>
          </motion.section>

          {/* Refund and Cancellation Policy */}
          <motion.section
            id="refund-policy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 scroll-mt-20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-red-500">Refund and Cancellation Policy</h2>
              <button
                onClick={() => navigator.clipboard.writeText(`https://streamvallabh.life/terms#refund-policy`)}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Copy Link
              </button>
            </div>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                Upon completing a Transaction, you are entering into a legally binding and enforceable agreement with us to purchase the product and/or service. After this point the User may cancel the Transaction unless it has been specifically provided for on the Platform. In which case, the cancellation will be subject to the terms mentioned on the Platform.
              </p>
              
              <p>
                We shall retain the discretion in approving any cancellation requests and we may ask for additional details before approving any requests. Once you have received the product and/or service, the only event where you can request for a replacement or a return and a refund is if the product and/or service does not match the description as mentioned on the Platform.
              </p>
              
              <div className="bg-zinc-800 rounded-lg p-6 border-l-4 border-red-500">
                <h3 className="text-lg font-bold text-red-400 mb-3">Refund Process</h3>
                <p>
                  Any request for refund must be submitted within <strong className="text-white">three days</strong> from the date of the Transaction or such number of days prescribed on the Platform, which shall in no event be less than three days.
                </p>
                <p className="mt-3">
                  A User may submit a claim for a refund by contacting us at:
                </p>
                <p className="text-red-400 font-semibold mt-2">
                  📧 srivallabhkakarala@gmail.com
                </p>
                <p className="mt-3">
                  Please provide a clear and specific reason for the refund request, including the exact terms that have been violated, along with any proof, if required.
                </p>
              </div>
              
              <p>
                Whether a refund will be provided will be determined by us, and we may ask for additional details before approving any requests.
              </p>
            </div>
          </motion.section>

          {/* Shipping and Delivery Policy */}
          <motion.section
            id="shipping-policy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 scroll-mt-20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-red-500">Shipping and Delivery Policy</h2>
              <button
                onClick={() => navigator.clipboard.writeText(`https://streamvallabh.life/terms#shipping-policy`)}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Copy Link
              </button>
            </div>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                You hereby agree that the delivery dates are estimates, unless a fixed date for the delivery has been expressly agreed in writing. The cost for delivery shall be calculated at the time of initiation of Transaction based on the shipping address and will be collected from you as a part of the Transaction Amount paid for the products and/or services.
              </p>
              
              <div className="bg-zinc-800 rounded-lg p-6 border-l-4 border-red-500">
                <h3 className="text-lg font-bold text-red-400 mb-3">Delivery Timeline</h3>
                <p>
                  In the event that you do not receive the delivery even after <strong className="text-white">seven days</strong> have passed from the estimated date of delivery, you must promptly reach out to us.
                </p>
                <p className="mt-3">
                  Contact us immediately at:
                </p>
                <p className="text-red-400 font-semibold mt-2">
                  📧 srivallabhkakarala@gmail.com
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-2">Digital Services</h4>
                  <p className="text-sm text-gray-400">
                    Web development, app development, ML models, and AI agents are delivered digitally via email or secure platforms.
                  </p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-2">Delivery Method</h4>
                  <p className="text-sm text-gray-400">
                    All deliverables will be sent to your registered email address or through agreed collaboration platforms.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Direct Link Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-r from-red-900 to-black rounded-xl p-8 border border-red-800"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Direct Links</h2>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg">
                You can access each policy directly using these URLs:
              </p>
              <div className="bg-black/50 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-red-400 font-semibold">Terms & Conditions:</span>
                    <span className="text-white text-sm break-all">https://streamvallabh.life/terms#terms-conditions</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-red-400 font-semibold">Refund Policy:</span>
                    <span className="text-white text-sm break-all">https://streamvallabh.life/terms#refund-policy</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-red-400 font-semibold">Shipping Policy:</span>
                    <span className="text-white text-sm break-all">https://streamvallabh.life/terms#shipping-policy</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Contact Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-red-900 to-black rounded-xl p-8 border border-red-800"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Contact Information</h2>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg">
                For any questions, concerns, or support regarding these policies, please contact us:
              </p>
              <div className="bg-black/50 rounded-lg p-6">
                <div className="space-y-3">
                  <p className="flex items-center gap-3">
                    <span className="text-red-400 font-semibold">📧 Email:</span>
                    <span className="text-white">srivallabhkakarala@gmail.com</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="text-red-400 font-semibold">👨‍💻 Developer:</span>
                    <span className="text-white">Sreevallabh Kakarala</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="text-red-400 font-semibold">📍 Location:</span>
                    <span className="text-white">India</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 Sreevallabh Kakarala. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Terms; 