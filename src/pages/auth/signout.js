import React from 'react';
import { signOut, getSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiLogOut, FiCheckCircle } from 'react-icons/fi';
import Layout from '../../components/Layout';

const SignOut = () => {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <Layout title="Sign Out - BA Sports" description="Sign out of your BA Sports account">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <FiLogOut className="text-red-400" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Sign Out
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Are you sure you want to sign out of your account?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8"
          >
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-white/80">
                  <FiCheckCircle className="text-green-400" size={16} />
                  <span className="text-sm">Your data is safely stored</span>
                </div>
                <p className="text-white/60 text-sm">
                  You can sign back in anytime to access your profile, orders, and Gmail integration.
                </p>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignOut}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Yes, Sign Out
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.history.back()}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SignOut;
