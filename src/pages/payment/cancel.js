import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiXCircle, FiRefreshCw, FiHome, FiShoppingCart } from 'react-icons/fi';
import Layout from '../../components/Layout';

const PaymentCancelPage = () => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Get order details from URL parameters
    const { transaction_id, order_id, reason } = router.query;
    
    if (transaction_id && order_id) {
      setOrderDetails({
        transactionId: transaction_id,
        orderId: order_id,
        reason: reason || 'Payment was cancelled by user'
      });
    }
  }, [router.query]);

  const handleRetryPayment = () => {
    // Redirect back to checkout
    router.push('/checkout');
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  return (
    <Layout title="Payment Cancelled - BA Sports">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-center"
          >
            {/* Cancel Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-red-500/20 backdrop-blur-xl border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiXCircle size={48} className="text-red-400" />
            </motion.div>

            {/* Cancel Message */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Payment Cancelled
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200 text-lg mb-8"
            >
              Your payment was not completed. No charges have been made to your account.
            </motion.p>

            {/* Order Details */}
            {orderDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-white/60 text-sm">Order ID</p>
                    <p className="text-white font-medium">{orderDetails.orderId}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Transaction ID</p>
                    <p className="text-white font-medium">{orderDetails.transactionId}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-white/60 text-sm">Reason</p>
                    <p className="text-red-400 font-medium">{orderDetails.reason}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={handleRetryPayment}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Try Again
              </button>

              <button
                onClick={handleBackToCart}
                className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FiShoppingCart className="mr-2" />
                Back to Cart
              </button>

              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <FiHome className="mr-2" />
                Back to Home
              </button>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 p-4 bg-yellow-500/10 backdrop-blur-sm border border-yellow-400/20 rounded-lg"
            >
              <p className="text-yellow-200 text-sm">
                Your cart items are still saved. You can complete your purchase anytime by returning to your cart.
              </p>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
            >
              <h4 className="text-white font-semibold mb-2">Need Help?</h4>
              <p className="text-white/60 text-sm mb-3">
                If you're experiencing payment issues, please contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 text-sm">
                <span className="text-white/60">Email: support@basports.com</span>
                <span className="text-white/60">Phone: +92-XXX-XXXXXXX</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCancelPage;

