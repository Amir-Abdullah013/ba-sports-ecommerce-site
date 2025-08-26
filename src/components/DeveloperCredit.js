import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiCode, FiExternalLink } from 'react-icons/fi';

const DeveloperCredit = ({ 
  variant = 'default', // 'default', 'minimal', 'inline', 'card'
  showIcons = true,
  showDescription = true,
  className = '' 
}) => {
  const contactInfo = {
    name: 'Amir Abdullah',
    email: 'thecodeamir@gmail.com',
    phone: '03246800889',
    phoneLink: '+923246800889'
  };

  const variants = {
    // Default - Full section with background
    default: (
      <section className={`bg-white/5 backdrop-blur-xl border-y border-white/10 py-12 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              {showIcons && <FiCode className="w-5 h-5 text-blue-400" />}
              <h3 className="text-lg font-semibold text-white">
                Website Development
              </h3>
            </div>
            {showDescription && (
              <p className="text-gray-300 text-sm max-w-2xl mx-auto leading-relaxed mb-6">
                This e-commerce platform was professionally developed by{" "}
                <span className="text-blue-400 font-medium">{contactInfo.name}</span>, 
                a skilled full-stack developer specializing in modern web technologies. 
                For custom web development solutions and professional services, feel free to reach out.
              </p>
            )}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2 group">
                {showIcons && <FiMail className="w-4 h-4 group-hover:text-blue-400 transition-colors" />}
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  {contactInfo.email}
                </a>
              </div>
              <div className="text-gray-600">•</div>
              <div className="flex items-center space-x-2 group">
                {showIcons && <FiPhone className="w-4 h-4 group-hover:text-blue-400 transition-colors" />}
                <a
                  href={`tel:${contactInfo.phoneLink}`}
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    ),

    // Minimal - Simple text line
    minimal: (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-xs text-gray-500">
          Website developed by{" "}
          <span className="text-gray-400 font-medium">{contactInfo.name}</span>
          {" "} • {" "}
          <a
            href={`mailto:${contactInfo.email}`}
            className="hover:text-blue-400 transition-colors duration-200"
          >
            {contactInfo.email}
          </a>
          {" "} • {" "}
          <a
            href={`tel:${contactInfo.phoneLink}`}
            className="hover:text-blue-400 transition-colors duration-200"
          >
            {contactInfo.phone}
          </a>
        </p>
      </div>
    ),

    // Inline - For use within existing content
    inline: (
      <span className={`text-sm text-gray-400 ${className}`}>
        Developed by{" "}
        <a
          href={`mailto:${contactInfo.email}`}
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
        >
          {contactInfo.name}
        </a>
      </span>
    ),

    // Card - Standalone card component
    card: (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 ${className}`}
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            {showIcons && <FiCode className="w-5 h-5 text-blue-400" />}
            <h4 className="text-lg font-semibold text-white">
              Custom Development
            </h4>
          </div>
          {showDescription && (
            <p className="text-gray-300 text-sm mb-4">
              Need a custom website or e-commerce solution? 
              Contact {contactInfo.name} for professional web development services.
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              {showIcons && <FiMail className="w-4 h-4" />}
              <span>{contactInfo.email}</span>
            </a>
            <a
              href={`tel:${contactInfo.phoneLink}`}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              {showIcons && <FiPhone className="w-4 h-4" />}
              <span>{contactInfo.phone}</span>
            </a>
          </div>
        </div>
      </motion.div>
    )
  };

  return variants[variant] || variants.default;
};

export default DeveloperCredit;
