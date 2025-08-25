import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLink, FiTwitter, FiFacebook, FiInstagram, FiMail, FiCopy, FiCheck, FiMessageCircle } from 'react-icons/fi';

const ShareModal = ({ isOpen, onClose, product }) => {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${product?.name} - Check out this amazing product!`;
  const shareUrl = currentUrl;

  const shareMethods = [
    {
      name: 'Copy Link',
      icon: copied ? FiCheck : FiCopy,
      color: copied ? 'text-green-400' : 'text-blue-400',
      bgColor: copied ? 'bg-green-400/20' : 'bg-blue-400/20',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setShareMethod('Link copied!');
          setTimeout(() => {
            setCopied(false);
            setShareMethod('');
          }, 2000);
        } catch (error) {
          console.error('Failed to copy:', error);
          setShareMethod('Failed to copy link');
        }
      }
    },
    {
      name: 'Twitter',
      icon: FiTwitter,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank');
        setShareMethod('Opened Twitter');
      }
    },
    {
      name: 'Facebook',
      icon: FiFacebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/20',
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank');
        setShareMethod('Opened Facebook');
      }
    },
    {
      name: 'Email',
      icon: FiMail,
      color: 'text-red-400',
      bgColor: 'bg-red-400/20',
      action: () => {
        const emailUrl = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`Check out this product: ${shareUrl}`)}`;
        window.open(emailUrl);
        setShareMethod('Opened Email');
      }
    },
    {
      name: 'WhatsApp',
      icon: FiMessageCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      action: () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        window.open(whatsappUrl, '_blank');
        setShareMethod('Opened WhatsApp');
      }
    }
  ];

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: shareText,
          url: shareUrl
        });
        setShareMethod('Shared via native share');
      } catch (error) {
        console.log('Web share cancelled or failed');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Product</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Product Info */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3">
                <img
                  src={product?.image || '/api/placeholder/60/60'}
                  alt={product?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="text-white font-medium">{product?.name}</h4>
                  <p className="text-white/60 text-sm">${product?.price}</p>
                </div>
              </div>
            </div>

            {/* Share Methods */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {shareMethods.map((method) => (
                <motion.button
                  key={method.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={method.action}
                  className={`p-4 rounded-xl border border-white/10 ${method.bgColor} hover:bg-white/10 transition-colors`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <method.icon size={24} className={method.color} />
                    <span className="text-white text-sm font-medium">{method.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Native Share Button (Mobile) */}
            {navigator.share && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWebShare}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Share via System
              </motion.button>
            )}

            {/* Status Message */}
            {shareMethod && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-center text-sm"
              >
                {shareMethod}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
