import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiShoppingBag, FiCamera, FiEdit3, FiSave, FiX, FiUpload, FiPhone, FiMapPin, FiUsers, FiRefreshCw } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAccounts } from '../hooks/useAccounts';
import AccountSwitcher from '../components/AccountSwitcher';


const ProfilePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const fileInputRef = useRef(null);
  const { 
    hasMultipleAccounts, 
    otherAccounts, 
    addAccount, 
    isLoading: accountsLoading 
  } = useAccounts();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Create user object from session
    const userData = {
      id: session.user.id || session.user.email,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role || 'customer', // Use session role or default
      joinDate: new Date().toISOString(),
      orders: 0,
      phone: '',
      address: ''
    };

    // Load additional user data from localStorage if exists
    const savedUserData = localStorage.getItem(`userData_${userData.id}`);
    if (savedUserData) {
      const parsed = JSON.parse(savedUserData);
      Object.assign(userData, parsed);
    }

    setUser(userData);
    setEditedUser(userData);

    // Load profile image from localStorage if exists (Google image as fallback)
    const savedImage = localStorage.getItem(`profileImage_${userData.id}`);
    if (savedImage) {
      setImagePreview(savedImage);
    } else if (session.user.image) {
      setImagePreview(session.user.image);
    }
  }, [session, status, router]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setImagePreview(imageData);
        setProfileImage(file);
        // Save to localStorage
        localStorage.setItem(`profileImage_${user.id}`, imageData);
        
        // Dispatch custom event to notify navbar
        window.dispatchEvent(new CustomEvent('profileImageUpdated', {
          detail: {
            userId: user.id,
            imageData: imageData
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      const updatedUser = { ...user, ...editedUser };
      setUser(updatedUser);
      localStorage.setItem(`userData_${user.id}`, JSON.stringify(updatedUser));
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = async () => {
    try {
      // Clear any local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Force sign out
      await signOut({ 
        callbackUrl: '/',
        redirect: false 
      });
      
      // Force page reload to clear everything
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect anyway
      window.location.href = '/';
    }
  };

  if (status === 'loading' || !user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/80">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile - BA Sports" description="Manage your account and view your order history">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="relative py-20 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                My Profile
              </h1>
              <p className="text-xl text-blue-100">
                Manage your account and preferences
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">
                    Account Information
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditToggle}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                      isEditing
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isEditing ? <FiSave size={16} /> : <FiEdit3 size={16} />}
                    <span>{isEditing ? 'Save' : 'Edit'}</span>
                  </motion.button>
                </div>
                
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <FiCamera size={14} />
                    </motion.button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-2xl font-bold bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Your name"
                      />
                    ) : (
                      <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                    )}
                    <p className="text-blue-200 mt-1">
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </p>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      <FiMail className="inline mr-2" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedUser.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {user.email}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      <FiPhone className="inline mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedUser.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="+92-XXX-XXXXXXX"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {user.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      <FiMapPin className="inline mr-2" />
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Your address"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {user.address || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Member Since */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      <FiCalendar className="inline mr-2" />
                      Member Since
                    </label>
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                      {new Date(user.joinDate || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Account Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                    <FiShoppingBag className="mx-auto text-blue-400 mb-2" size={24} />
                    <p className="text-2xl font-bold text-white">{user.orders || 0}</p>
                    <p className="text-white/60 text-sm">Orders</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                    <FiUser className="mx-auto text-green-400 mb-2" size={24} />
                    <p className="text-2xl font-bold text-white">
                      {Math.floor((new Date() - new Date(user.joinDate || Date.now())) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-white/60 text-sm">Days</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                    <div className="w-6 h-6 bg-green-400 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-green-400">Active</p>
                    <p className="text-white/60 text-sm">Status</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                    <div className="w-6 h-6 bg-purple-400 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-purple-400 capitalize">{user.role}</p>
                    <p className="text-white/60 text-sm">Role</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-6">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/products')}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Browse Products
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/cart')}
                    className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    View Cart
                  </motion.button>

                 

                  {/* Account Management */}
                  {hasMultipleAccounts ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAccountSwitcher(true)}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                      disabled={accountsLoading}
                    >
                      {accountsLoading ? (
                        <FiRefreshCw className="animate-spin" size={16} />
                      ) : (
                        <FiUsers size={16} />
                      )}
                      <span>Switch Account ({otherAccounts.length + 1})</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addAccount}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                      disabled={accountsLoading}
                    >
                      {accountsLoading ? (
                        <FiRefreshCw className="animate-spin" size={16} />
                      ) : (
                        <FiUser size={16} />
                      )}
                      <span>Add Account</span>
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/support')}
                    className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    Get Support
                  </motion.button>

                  {user.role === 'admin' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/admin')}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Admin Dashboard
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </motion.button>
                </div>
              </motion.div>

              {/* Upload Instructions */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Profile Picture
                </h3>
                
                <div className="space-y-3 text-white/80 text-sm">
                  <div className="flex items-center space-x-2">
                    <FiUpload className="text-blue-400" size={16} />
                    <span>Max size: 5MB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCamera className="text-green-400" size={16} />
                    <span>Formats: JPG, PNG, GIF</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                    <span>Recommended: Square images</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Switcher Modal */}
      <AccountSwitcher 
        isOpen={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
      />
    </Layout>
  );
};

export default ProfilePage;