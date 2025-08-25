import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiRefreshCw, FiHome } from 'react-icons/fi';
import Layout from '../../components/Layout';

const AuthError = () => {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You cancelled the authentication process.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An unexpected error occurred during authentication.';
    }
  };

  const getErrorDescription = (error) => {
    switch (error) {
      case 'Configuration':
        return 'Please contact support if this problem persists.';
      case 'AccessDenied':
        return 'You need to grant permission to access your Google account.';
      case 'Verification':
        return 'Please try signing in again.';
      default:
        return 'Please try again or contact support if the issue continues.';
    }
  };

  return (
    <Layout title="Authentication Error - BA Sports" description="An error occurred during authentication">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <FiAlertCircle className="text-red-400" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              {getErrorMessage(error)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8"
          >
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-white/70 text-sm">
                  {getErrorDescription(error)}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-xs font-mono">
                    Error Code: {error}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/auth/signin')}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FiRefreshCw size={16} />
                  <span>Try Again</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
                >
                  <FiHome size={16} />
                  <span>Go Home</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <p className="text-xs text-white/60">
              If you continue to experience issues, please contact our support team.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthError;
