import React from 'react';
import { getProviders, signIn, getSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiMail, FiShield, FiCheck } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import Layout from '../../components/Layout';

const SignIn = ({ providers }) => {
  return (
    <Layout title="Sign In - BA Sports" description="Sign in to your BA Sports account">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="mt-6 text-3xl font-bold text-white">
              Welcome to BA Sports
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Sign in to access your account
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8"
          >
            <div className="space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  What you'll get:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-white/80">
                    <FiCheck className="text-green-400 flex-shrink-0" size={16} />
                    <span className="text-sm">Access to your profile and orders</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/80">
                    <FiMail className="text-blue-400 flex-shrink-0" size={16} />
                    <span className="text-sm">Order tracking and notifications</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/80">
                    <FiShield className="text-purple-400 flex-shrink-0" size={16} />
                    <span className="text-sm">Secure authentication with Google</span>
                  </div>
                </div>
              </div>

              {/* Sign In Buttons */}
              <div className="space-y-4">
                {providers && Object.values(providers).map((provider) => (
                  <motion.button
                    key={provider.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signIn(provider.id, { callbackUrl: '/admin-redirect' })}
                    className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-medium transition-all duration-300 border border-gray-300 shadow-sm"
                  >
                    <FaGoogle className="text-red-500" size={20} />
                    <span>Sign in with {provider.name}</span>
                  </motion.button>
                ))}
                {!providers && (
                  <div className="text-center py-4">
                    <p className="text-white/80">Authentication providers not available</p>
                  </div>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="text-center">
                <p className="text-xs text-white/60">
                  By signing in, you agree to our terms of service and privacy policy.
                  We only access your basic profile information with your permission.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <p className="text-sm text-white/70">
              New to BA Sports?{' '}
              <span className="text-blue-400 font-medium">
                Your account will be created automatically upon first sign-in.
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps() {
  try {
    const providers = await getProviders();
    return {
      props: { providers: providers || {} },
    };
  } catch (error) {
    console.error('Error getting providers:', error);
    return {
      props: { providers: {} },
    };
  }
}

export default SignIn;
