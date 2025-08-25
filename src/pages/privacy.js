import { motion } from 'framer-motion';
import { FiShield, FiEye, FiLock, FiDatabase, FiUserCheck, FiMail } from 'react-icons/fi';
import Layout from '../components/Layout';

const PrivacyPolicy = () => {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: FiDatabase,
      content: [
        'Personal Information: When you create an account, make a purchase, or contact us, we may collect personal information such as your name, email address, phone number, shipping address, and payment information.',
        'Usage Data: We collect information about how you use our website, including pages visited, time spent on our site, and interaction with our content.',
        'Device Information: We may collect information about your device, including IP address, browser type, operating system, and device identifiers.',
        'Cookies and Tracking: We use cookies and similar technologies to enhance your browsing experience and analyze website traffic.'
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: FiUserCheck,
      content: [
        'Process and fulfill your orders and provide customer service',
        'Communicate with you about your account, orders, and our services',
        'Improve our website, products, and services based on your feedback and usage patterns',
        'Send you promotional materials and updates (with your consent)',
        'Detect and prevent fraud, abuse, and other harmful activities',
        'Comply with legal obligations and protect our rights and interests'
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: FiEye,
      content: [
        'Service Providers: We may share your information with trusted third-party service providers who help us operate our business, such as payment processors, shipping companies, and marketing platforms.',
        'Legal Requirements: We may disclose your information if required by law, court order, or government request.',
        'Business Transfers: In the event of a merger, acquisition, or sale of our business, your information may be transferred to the new owner.',
        'Consent: We may share your information for other purposes with your explicit consent.'
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: FiLock,
      content: [
        'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
        'We use industry-standard encryption for sensitive data transmission and storage.',
        'Our staff is trained on data protection practices and has access to personal information only on a need-to-know basis.',
        'Regular security audits and updates ensure our systems remain secure against emerging threats.'
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      icon: FiShield,
      content: [
        'Access: You have the right to request access to the personal information we hold about you.',
        'Correction: You can request that we correct any inaccurate or incomplete personal information.',
        'Deletion: You may request that we delete your personal information, subject to certain legal limitations.',
        'Portability: You have the right to receive your personal information in a structured, machine-readable format.',
        'Objection: You can object to certain processing of your personal information, including marketing communications.',
        'Withdrawal: You may withdraw your consent to processing at any time where we rely on consent.'
      ]
    }
  ];

  return (
    <Layout title="Privacy Policy - BA Sports" description="Learn how BA Sports protects your privacy and handles your personal information.">
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
                <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 rounded-full flex items-center justify-center">
                  <FiShield size={32} className="text-blue-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
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
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-white/80 leading-relaxed">
              BA Sports ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, 
              make a purchase, or interact with our services. By using our services, you agree to the collection and use of information 
              in accordance with this policy.
            </p>
          </motion.div>

          {/* Privacy Sections */}
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
                    <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 rounded-lg flex items-center justify-center mr-4">
                      <IconComponent size={24} className="text-blue-400" />
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
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-400/30 rounded-2xl shadow-2xl p-8 mt-12"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 rounded-lg flex items-center justify-center mr-4">
                <FiMail size={24} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Contact Us About Privacy</h3>
            </div>
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                If you have any questions about this Privacy Policy, your personal information, or wish to exercise your rights, 
                please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Email</h4>
                  <p className="text-blue-400">adilg13@gmail.com</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Phone</h4>
                  <p className="text-blue-400">+92-308-6144848</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Address</h4>
                  <p className="text-white/80">
                    Bank Road, near Allied Bank<br />
                    Sports Bazar, Sialkot<br />
                    Punjab, Pakistan
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Response Time</h4>
                  <p className="text-white/80">We aim to respond to all privacy inquiries within 30 days.</p>
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
              This Privacy Policy may be updated from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
