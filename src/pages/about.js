import { motion } from 'framer-motion';
import { FiTarget, FiHeart, FiAward, FiUsers } from 'react-icons/fi';
import Layout from '../components/Layout';

const AboutPage = () => {
  const values = [
    {
      icon: FiTarget,
      title: 'Our Mission',
      description: 'To provide athletes of all levels with premium sports equipment that enhances performance and inspires excellence.'
    },
    {
      icon: FiHeart,
      title: 'Our Passion',
      description: 'We are passionate about sports and believe that the right equipment can make all the difference in achieving your goals.'
    },
    {
      icon: FiAward,
      title: 'Our Quality',
      description: 'We partner with leading brands and maintain the highest quality standards in every product we offer.'
    },
    {
      icon: FiUsers,
      title: 'Our Community',
      description: 'We foster a community of athletes, supporting each other in the pursuit of athletic excellence and personal growth.'
    }
  ];

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      description: 'Former professional athlete with 15+ years in sports retail',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Sarah Johnson',
      role: 'Head of Product',
      description: 'Sports equipment expert with deep industry knowledge',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Mike Chen',
      role: 'Customer Experience',
      description: 'Dedicated to ensuring every customer has an amazing experience',
      image: '/api/placeholder/300/300'
    }
  ];

  return (
    <Layout title="About Us - BA Sports" description="Learn about BA Sports, our mission, values, and the team behind your favorite sports equipment store.">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <section className="relative py-20 text-white overflow-hidden">
          {/* Add floating animations like Products page */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large Gradient Orbs */}
            <motion.div
              className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 30, 0],
                y: [0, 20, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-10 -right-20 w-60 h-60 bg-gradient-to-br from-purple-400/25 to-pink-500/25 rounded-full blur-3xl"
              animate={{
                scale: [1.1, 1, 1.1],
                x: [0, -20, 0],
                y: [0, 30, 0],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            
            {/* Floating Stars */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute w-3 h-3"
                style={{
                  left: `${15 + (i * 12) % 70}%`,
                  top: `${20 + (i * 15) % 60}%`,
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 8 + i * 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
              >
                <div className="absolute inset-0 bg-yellow-400/30 transform rotate-45" />
                <div className="absolute inset-0 bg-yellow-400/30 transform -rotate-45" />
              </motion.div>
            ))}
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                About BA Sports
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Empowering athletes worldwide with premium sports equipment and unmatched service since 2020
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold text-white mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-white/90 text-lg leading-relaxed">
                  <p>
                    BA Sports was born from a simple belief: every athlete deserves access to high-quality 
                    sports equipment that can help them reach their full potential. Founded in 2020 by former 
                    professional athletes and sports enthusiasts, we set out to create a company that truly 
                    understands the needs of athletes at every level.
                  </p>
                  <p>
                    What started as a small online store has grown into a trusted destination for sports 
                    equipment, serving thousands of customers worldwide. We've built lasting relationships 
                    with top brands and manufacturers to ensure we can offer the latest innovations and 
                    time-tested classics.
                  </p>
                  <p>
                    Today, we continue to expand our product range while maintaining our commitment to 
                    quality, authenticity, and customer satisfaction. Every product in our catalog is 
                    carefully selected and tested to meet our high standards.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <img
                  src="/favicon.svg"
                  alt="BA Sports Story"
                  className="rounded-2xl shadow-2xl "
                />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-600 rounded-full opacity-20" />
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-600 rounded-full opacity-20" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Our Values
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                These core values guide everything we do and shape our commitment to our customers
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.8 }}
                    whileHover={{ y: -5 }}
                    className="text-center p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 relative text-white overflow-hidden">
          {/* Add some floating elements for visual interest */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating gift boxes */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`gift-${i}`}
                className="absolute w-8 h-8 opacity-20"
                style={{
                  left: `${10 + (i * 20) % 80}%`,
                  top: `${15 + (i * 25) % 70}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 180, 360],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 6 + i * 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-lg" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-red-400/40" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-1 bg-red-400/40" />
              </motion.div>
            ))}
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">
                Our Impact
              </h2>
              <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                Numbers that show our commitment to the sports community
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: '10,000+', label: 'Happy Customers' },
                { number: '500+', label: 'Premium Products' },
                { number: '50+', label: 'Sports Categories' },
                { number: '99%', label: 'Satisfaction Rate' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="text-center"
                >
                  <div className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-blue-200 text-lg">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          {/* Add floating elements for visual consistency */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-10 -left-10 w-60 h-60 bg-gradient-to-br from-blue-400/15 to-purple-500/15 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                x: [0, 20, 0],
                y: [0, 15, 0],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-10 -right-10 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1.1, 1, 1.1],
                x: [0, -15, 0],
                y: [0, 25, 0],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold text-white">
                Ready to Join Our Community?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Discover premium sports equipment and become part of our growing community of athletes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/products"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Shop Now
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/contact"
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  Contact Us
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
