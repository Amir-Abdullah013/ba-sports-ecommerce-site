import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle, FiMessageCircle, FiPhone, FiMail, FiClock, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Layout from '../components/Layout';

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const supportOptions = [
    {
      icon: FiMessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      color: 'from-blue-500 to-cyan-600',
      available: 'Available 9 AM - 7 PM'
    },
    {
      icon: FiPhone,
      title: 'Phone Support',
      description: 'Speak directly with our support specialists',
      action: 'Call Now',
      color: 'from-green-500 to-emerald-600',
      available: '+923086144848'
    },
    
    {
      icon: FiHelpCircle,
      title: 'Help Center',
      description: 'Browse our comprehensive knowledge base',
      action: 'Browse Articles',
      color: 'from-orange-500 to-red-600',
      available: '24/7 Available'
    }
  ];

  const faqs = [
    {
      category: 'Orders & Shipping',
      questions: [
        {
          question: 'How can I track my order?',
          answer: 'Once your order is shipped, you will receive a tracking number via email. You can use this number to track your package on our website or the courier\'s website. You can also check your order status by logging into your account.'
        },
        {
          question: 'What are your shipping options and costs?',
          answer: 'We offer standard shipping (3-5 business days) and express shipping (1-2 business days) throughout Pakistan. Shipping costs vary by location and weight. Free shipping is available on orders over PKR 2,000.'
        },
        {
          question: 'Can I change or cancel my order?',
          answer: 'You can modify or cancel your order within 2 hours of placing it. After this time, the order enters processing and cannot be changed. Please contact our support team immediately if you need to make changes.'
        }
      ]
    },
    {
      category: 'Products & Sizing',
      questions: [
        {
          question: 'How do I choose the right size?',
          answer: 'Each product page includes a detailed size chart. We recommend measuring yourself and comparing with our size guide. If you\'re between sizes, we generally recommend sizing up. Our customer service team can also provide personalized sizing advice.'
        },
        {
          question: 'Are your products authentic?',
          answer: 'Yes, all our products are 100% authentic and sourced directly from authorized distributors and manufacturers. We guarantee the authenticity of every item we sell.'
        },
        {
          question: 'Do you offer product warranties?',
          answer: 'Most of our products come with manufacturer warranties. The warranty period varies by brand and product type. Please check the product description for specific warranty information.'
        }
      ]
    },
    {
      category: 'Returns & Exchanges',
      questions: [
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for unused items in original packaging. Items must be in the same condition as received. Some items like personalized products may not be eligible for return.'
        },
        {
          question: 'How do I return an item?',
          answer: 'Contact our customer service team to initiate a return. We\'ll provide you with a return authorization number and instructions. You can also start the return process through your account dashboard.'
        },
        {
          question: 'How long do refunds take?',
          answer: 'Refunds are processed within 7-10 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.'
        }
      ]
    },
    {
      category: 'Account & Payment',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Click on the "Sign Up" button in the top right corner of our website. Fill in your details including name, email, and password. You\'ll receive a confirmation email to verify your account.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept major credit cards (Visa, Mastercard), debit cards, bank transfers, and cash on delivery. All online payments are processed securely through encrypted payment gateways.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Yes, we use industry-standard SSL encryption to protect your payment information. We do not store your credit card details on our servers. All transactions are processed through secure payment gateways.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  return (
    <Layout title="Support - BA Sports" description="Get help and support for your BA Sports experience. Find answers to common questions and contact our support team.">
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
                <div className="w-16 h-16 bg-green-500/20 backdrop-blur-xl border border-green-400/30 rounded-full flex items-center justify-center">
                  <FiHelpCircle size={32} className="text-green-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                How Can We Help?
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
                We're here to support you every step of the way. Find answers, get help, and connect with our team.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Support Options */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Choose Your Support Option
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <motion.div
                    key={option.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 text-center hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
                    <p className="text-white/70 text-sm mb-4">{option.description}</p>
                    <p className="text-white/60 text-xs mb-4">{option.available}</p>
                    {option.title === 'Phone Support' ? (
                      <a
                        href={`tel:${option.available}`}
                        className="w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium inline-block"
                      >
                        {option.action}
                      </a>
                    ) : (
                      <button className="w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium">
                        {option.action}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* FAQ Search */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for answers..."
                  className="w-full px-4 py-4 pl-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
              </div>
            </div>
          </motion.section>

          {/* FAQ Categories */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {filteredFaqs.length > 0 ? (
              <div className="space-y-8">
                {filteredFaqs.map((category, categoryIndex) => (
                  <div key={category.category} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-6">{category.category}</h3>
                    <div className="space-y-4">
                      {category.questions.map((faq, questionIndex) => {
                        const key = `${categoryIndex}-${questionIndex}`;
                        const isExpanded = expandedFaq === key;
                        return (
                          <div key={questionIndex} className="border-b border-white/10 last:border-b-0 pb-4 last:pb-0">
                            <button
                              onClick={() => toggleFaq(categoryIndex, questionIndex)}
                              className="w-full flex items-center justify-between text-left py-3 hover:bg-white/5 rounded-lg px-3 transition-colors"
                            >
                              <span className="text-white font-medium">{faq.question}</span>
                              {isExpanded ? (
                                <FiChevronUp className="text-white/60 flex-shrink-0 ml-4" size={20} />
                              ) : (
                                <FiChevronDown className="text-white/60 flex-shrink-0 ml-4" size={20} />
                              )}
                            </button>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-3 pb-3"
                              >
                                <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiSearch className="mx-auto text-white/30 mb-4" size={64} />
                <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                <p className="text-white/60">Try searching with different keywords or contact our support team directly.</p>
              </div>
            )}
          </motion.section>

          {/* Contact Support */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-400/30 rounded-2xl shadow-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Still Need Help?</h3>
              <p className="text-white/80 mb-6">
                Can't find what you're looking for? Our support team is ready to help you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  Contact Support
                </button>
                <button className="px-8 py-3 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Request Callback
                </button>
              </div>
              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-white/60">
                <div className="flex items-center space-x-2">
                  <FiClock size={16} />
                  <span>Mon-Sat: 8:30 AM - 7:00 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone size={16} />
                  <span>+92-308-6144848</span>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
