import { motion } from 'framer-motion';
import { FiFileText, FiShoppingCart, FiRotateCcw, FiAlertTriangle, FiShield, FiCreditCard } from 'react-icons/fi';
import Layout from '../components/Layout';

const TermsOfService = () => {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: FiFileText,
      content: [
        'By accessing and using the BA Sports website and services, you accept and agree to be bound by the terms and provision of this agreement.',
        'If you do not agree to abide by the above, please do not use this service.',
        'These terms apply to all visitors, users, and others who access or use our service.',
        'We reserve the right to update these terms at any time without prior notice.'
      ]
    },
    {
      id: 'products-orders',
      title: 'Products and Orders',
      icon: FiShoppingCart,
      content: [
        'Product Information: We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.',
        'Pricing: All prices are subject to change without notice. Prices displayed include applicable taxes unless otherwise stated.',
        'Order Acceptance: Your receipt of an order confirmation does not signify our acceptance of your order. We reserve the right to accept or decline any order for any reason.',
        'Availability: Products are subject to availability. We reserve the right to discontinue any product at any time.',
        'Order Processing: Orders are typically processed within 1-2 business days. You will receive a confirmation email once your order has been shipped.'
      ]
    },
    {
      id: 'payment-billing',
      title: 'Payment and Billing',
      icon: FiCreditCard,
      content: [
        'Payment Methods: We accept various payment methods including credit cards, debit cards, and digital wallets.',
        'Payment Processing: All payments are processed securely through encrypted payment gateways.',
        'Billing: You agree to pay all charges incurred by you or any users of your account at the prices in effect when such charges are incurred.',
        'Currency: All prices are displayed in Pakistani Rupees (PKR) unless otherwise specified.',
        'Payment Failure: If payment fails or is declined, we reserve the right to cancel your order.'
      ]
    },
    {
      id: 'shipping-returns',
      title: 'Shipping and Returns',
      icon: FiRotateCcw,
      content: [
        'Shipping: We offer shipping throughout Pakistan. Delivery times vary based on location and product availability.',
        'Shipping Costs: Shipping costs are calculated based on weight, size, and destination. Free shipping may be available for orders above certain amounts.',
        'Return Policy: You may return products within 30 days of delivery in their original condition with original packaging.',
        'Return Process: To initiate a return, contact our customer service team. Return shipping costs may apply.',
        'Refunds: Refunds will be processed within 7-10 business days after we receive and inspect the returned items.',
        'Exchanges: We offer exchanges for different sizes or colors, subject to availability.'
      ]
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities',
      icon: FiAlertTriangle,
      content: [
        'Account Security: You are responsible for maintaining the confidentiality of your account credentials.',
        'Accurate Information: You agree to provide accurate and complete information when creating an account or placing an order.',
        'Prohibited Uses: You may not use our service for any illegal or unauthorized purpose.',
        'Intellectual Property: You may not reproduce, distribute, or create derivative works from our content without permission.',
        'User Conduct: You agree to use our service in a manner that does not infringe upon the rights of others.'
      ]
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      icon: FiShield,
      content: [
        'Disclaimer: Our service is provided "as is" without any warranties, express or implied.',
        'Limitation: In no event shall BA Sports be liable for any indirect, incidental, special, or consequential damages.',
        'Maximum Liability: Our total liability for any claim shall not exceed the amount you paid for the product or service in question.',
        'Force Majeure: We shall not be liable for any failure to perform due to circumstances beyond our reasonable control.',
        'Jurisdiction: These terms shall be governed by the laws of Pakistan.'
      ]
    }
  ];

  return (
    <Layout title="Terms of Service - BA Sports" description="Review the terms and conditions for using BA Sports services and making purchases.">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <section className="py-20 relative text-white overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-xl border border-purple-400/30 rounded-full flex items-center justify-center">
                  <FiFileText size={32} className="text-purple-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Terms of Service
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
                Please read these terms carefully before using our services. By using BA Sports, you agree to these terms.
              </p>
              <p className="text-sm text-white/60 mt-4">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to BA Sports</h2>
            <p className="text-white/80 leading-relaxed">
              These Terms of Service ("Terms") govern your use of our website and services provided by BA Sports located at 
              Bank Road, near Allied Bank, Sports Bazar, Sialkot, Punjab, Pakistan. These Terms apply to all visitors, users, 
              and others who access or use our service. By accessing or using our service, you agree to be bound by these Terms.
            </p>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-xl border border-purple-400/30 rounded-lg flex items-center justify-center mr-4">
                      <IconComponent size={24} className="text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{section.title}</h3>
                  </div>
                  <div className="space-y-4">
                    {section.content.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-white/80 leading-relaxed">
                        {item}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-400/30 rounded-2xl shadow-2xl p-8 mt-12"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Questions About These Terms?</h3>
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Email</h4>
                  <p className="text-purple-400">adilg13@gmail.com</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Phone</h4>
                  <p className="text-purple-400">+92-308-6144848</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <p className="text-white/60 text-sm">
              We reserve the right to update or change our Terms of Service at any time without prior notice. 
              Your continued use of the service after we post any modifications constitutes acceptance of the new Terms.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;