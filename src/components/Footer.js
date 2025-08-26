import Link from "next/link";
import { useState } from "react";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheck,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const socialLinks = [
    {
      icon: FiFacebook,
      href: "https://web.facebook.com/adilg13",
      label: "Facebook",
    },
    {
      icon: FaTiktok,
      href: "https://www.tiktok.com/@basportsskt",
      label: "TikTok",
    },
    { icon: FiInstagram, href: "https://www.instagram.com/ba_sports_official/?hl=en", label: "Instagram" },
  ];

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const categories = [
    { href: "/products?category=Football", label: "Football" },
    { href: "/products?category=Basketball", label: "Basketball" },
    { href: "/products?category=Tennis", label: "Tennis" },
    { href: "/products?category=Soccer", label: "Soccer" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubscribed(true);
    setIsLoading(false);
    setEmail("");

    // Reset subscription status after 5 seconds
    setTimeout(() => {
      setIsSubscribed(false);
    }, 5000);
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BA Sports
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your premier destination for high-quality sports equipment and
              gear. We provide top-notch products for athletes of all levels.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <FiMapPin className="text-blue-400" />
                <span>Bank Road, Near Allied Bank Sports Bazar Sialkot</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <FiPhone className="text-blue-400" />
                <span>+92-308-6144825</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <FiMail className="text-blue-400" />
                <span>adilg13@gmail.com</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Newsletter & Social */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Stay Connected</h4>
            <p className="text-gray-300 text-sm">
              Subscribe to our newsletter for the latest updates and exclusive
              offers.
            </p>
            <div className="space-y-3">
              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-400/30 rounded-md"
                >
                  <FiCheck className="text-green-400" size={16} />
                  <span className="text-green-300 text-sm font-medium">
                    Thank you! You're now subscribed to our newsletter.
                  </span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-r-md hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <span>Subscribe</span>
                    )}
                  </motion.button>
                </form>
              )}

              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-white hover:bg-blue-600 transition-all duration-200"
                      aria-label={social.label}
                    >
                      <IconComponent size={16} />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0"
        >
          <div className="text-sm text-gray-400">
            © 2024 BA Sports. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link
              href="/privacy"
              className="hover:text-blue-400 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-blue-400 transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              href="/support"
              className="hover:text-blue-400 transition-colors duration-200"
            >
              Support
            </Link>
          </div>
        </motion.div>

        {/* Developer Branding - Subtle & Professional */}
        <motion.div
          variants={itemVariants}
          className="mt-6 pt-4 border-t border-gray-800/50 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8"
        >
          <div className="text-xs text-gray-500 text-center sm:text-left">
            Website developed by{" "}
            <span className="text-gray-400 font-medium">Amir Abdullah</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1 group">
              <FiMail className="w-3 h-3 group-hover:text-blue-400 transition-colors duration-200" />
              <a
                href="mailto:thecodeamir@gmail.com"
                className="hover:text-blue-400 transition-colors duration-200"
              >
                thecodeamir@gmail.com
              </a>
            </div>
            <div className="text-gray-600">•</div>
            <div className="flex items-center space-x-1 group">
              <FiPhone className="w-3 h-3 group-hover:text-blue-400 transition-colors duration-200" />
              <a
                href="tel:+923246800889"
                className="hover:text-blue-400 transition-colors duration-200"
              >
                03246800889
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
