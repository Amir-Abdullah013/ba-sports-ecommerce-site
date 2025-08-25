import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import Layout from '../components/Layout';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: FiMapPin,
      title: 'Address',
      details: ['Bank Road, near Allied Bank', 'Sports Bazar, Sialkot', 'Punjab, Pakistan'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: FiPhone,
      title: 'Phone',
      details: ['+92-308-6144848', '+92-308-6144825 (WhatsApp)'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: FiMail,
      title: 'Email',
      details: ['adilg13@gmail.com'],
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: FiClock,
      title: 'Business Hours',
      details: ['Mon - Sat: 8:30 AM - 7:00 PM',  'Sun: Closed'],
      color: 'from-orange-500 to-red-600'
    }
  ];

  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unused items in original packaging. Free returns on orders over $50.'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship worldwide. Shipping costs and delivery times vary by location. Free shipping on orders over $100 within the US.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order ships, you will receive a tracking number via email. You can also track your order in your account dashboard.'
    },
    {
      question: 'Do you price match?',
      answer: 'Yes, we offer price matching on identical items from authorized retailers. Contact us with the competitor\'s price for verification.'
    }
  ];

  return (
    <Layout title="Contact Us - BA Sports" description="Get in touch with BA Sports. We're here to help with any questions about our products or services.">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <section className="py-20 relative text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Contact Us
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content - Centered */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Get in Touch
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                We're here to help you with any questions about our products, orders, or services.
                Choose the best way to reach us or visit our store location.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -2 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {info.title}
                    </h3>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-white/70 text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-6 mt-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 text-center">
                Find Us
              </h3>
              <div className="w-full h-64 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54312.65987654321!2d74.46789012345678!3d32.49123456789012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391eec8b1a2b3c4d%3A0x5e6f7a8b9c0d1e2f!2sBank%20Rd%2C%20Sialkot%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1697654321987!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="BA SPORTS Location - Bank Road, Sialkot"
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <p className="text-white/60 text-sm mb-2">
                  📍 Bank Road, near Allied Bank, Sports Bazar, Sialkot
                </p>
                <a
                  href="https://www.google.com/maps/search/Bank+Road+Sports+Bazar+Sialkot+Pakistan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  <FiMapPin size={16} />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Find quick answers to common questions about our products and services
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="space-y-2"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {faq.question}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;