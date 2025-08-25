import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMoreVertical, FiTrash2, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { useAccounts } from '../hooks/useAccounts';

const AccountSwitcher = ({ isOpen, onClose }) => {
  const {
    currentAccount,
    otherAccounts,
    addAccount,
    switchAccount,
    removeAccount,
    isLoading,
    hasMultipleAccounts
  } = useAccounts();

  const [showOptions, setShowOptions] = useState({});

  const toggleOptions = (email) => {
    setShowOptions(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const handleSwitchAccount = async (account) => {
    onClose();
    await switchAccount(account);
  };

  const handleAddAccount = async () => {
    onClose();
    await addAccount();
  };

  const handleRemoveAccount = (email, event) => {
    event.stopPropagation();
    removeAccount(email);
    setShowOptions(prev => ({ ...prev, [email]: false }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Account
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose which Google account to use
            </p>
          </div>

          {/* Current Account */}
          {currentAccount && (
            <div className="px-6 py-4 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                {currentAccount.picture ? (
                  <img
                    src={currentAccount.picture}
                    alt={currentAccount.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {currentAccount.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentAccount.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {currentAccount.email}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <FiCheck className="text-green-500" size={16} />
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Other Accounts */}
          <div className="max-h-60 overflow-y-auto">
            {otherAccounts.length > 0 && (
              <div className="px-6 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Other Accounts
                </p>
              </div>
            )}

            {otherAccounts.map((account) => (
              <div key={account.email} className="relative">
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSwitchAccount(account)}
                  disabled={isLoading}
                  className="w-full px-6 py-3 flex items-center space-x-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {account.picture ? (
                    <img
                      src={account.picture}
                      alt={account.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {account.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {account.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {account.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last used: {new Date(account.lastUsed).toLocaleDateString()}
                    </p>
                  </div>
                  {isLoading && (
                    <FiRefreshCw className="text-blue-500 animate-spin" size={16} />
                  )}
                </motion.button>

                {/* Account Options */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOptions(account.email);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <FiMoreVertical size={14} />
                </button>

                {/* Options Dropdown */}
                <AnimatePresence>
                  {showOptions[account.email] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-2 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
                    >
                      <button
                        onClick={(e) => handleRemoveAccount(account.email, e)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <FiTrash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Add Account Button */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddAccount}
              disabled={isLoading}
              className="w-full px-6 py-4 flex items-center space-x-3 text-left border-t border-gray-200/50 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <FiPlus className="text-gray-400" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Add another account
                </p>
                <p className="text-xs text-gray-500">
                  Sign in with a different Google account
                </p>
              </div>
              {isLoading && (
                <FiRefreshCw className="text-blue-500 animate-spin ml-auto" size={16} />
              )}
            </motion.button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200/50 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {hasMultipleAccounts 
                  ? `${otherAccounts.length + 1} accounts available`
                  : 'Add more accounts for easy switching'
                }
              </p>
              <button
                onClick={onClose}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AccountSwitcher;
