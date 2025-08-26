import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FiShoppingCart, FiMenu, FiX, FiUser, FiSearch, FiChevronDown, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccounts } from '../hooks/useAccounts';
import AccountSwitcher from './AccountSwitcher';
import { useRipple } from '../hooks/useRipple';

// API function to get products for search
const getProducts = async () => {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

const Navbar = ({ cartItems = [], onCartToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { hasMultipleAccounts, otherAccounts, isLoading } = useAccounts();
  const { addRipple, RippleContainer } = useRipple();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories?active=true');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  // Get user from session instead of localStorage
  const user = session?.user;
  
  // Get uploaded profile image from localStorage if exists
  const [uploadedProfileImage, setUploadedProfileImage] = useState(null);
  
  useEffect(() => {
    if (user?.id) {
      const savedImage = localStorage.getItem(`profileImage_${user.id}`);
      if (savedImage) {
        setUploadedProfileImage(savedImage);
      }
    }
  }, [user?.id]);

  // Category icons mapping
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Football': '🏈',
      'Basketball': '🏀', 
      'Cricket': '🏏',
      'Badminton': '🏸',
      'Running': '🏃',
      'Baseball': '⚾',
      'Soccer': '⚽',
      'Volleyball': '🏐',
      'Sports Equipment': '🎯',
      'Tennis': '🎾',
      'Swimming': '🏊',
      'Fitness': '💪'
    };
    return iconMap[categoryName] || '🏅';
  };

  // Listen for profile image updates
  useEffect(() => {
    const handleProfileImageUpdate = (e) => {
      if (e.detail && e.detail.userId === user?.id) {
        setUploadedProfileImage(e.detail.imageData);
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
    return () => window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
  }, [user?.id]);

  useEffect(() => {
    // Load products for search
    const loadProducts = async () => {
      try {
        const products = await getProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Failed to load products for search:', error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    // Search functionality with debounce
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = allProducts.filter(product => {
        // Extract category name whether it's an object or string
        const categoryName = typeof product.category === 'object' 
          ? product.category.name 
          : product.category;
        
        return (
          product.name.toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query))
        );
      });
      setSearchResults(filtered.slice(0, 6)); // Limit to 6 results
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allProducts]);

  useEffect(() => {
    // Close search modal when clicking outside
    const handleClickOutside = (event) => {
      if (isSearchOpen && !event.target.closest('[data-search-modal]')) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { 
      href: '/', 
      label: 'Home',
      hasDropdown: false
    },
    { 
      href: '/products', 
      label: 'Products',
      hasDropdown: true,
      dropdownItems: categories.map(category => ({
        href: `/products?category=${encodeURIComponent(category.name)}`,
        label: category.name,
        icon: getCategoryIcon(category.name)
      }))
    },
    ...(session?.user ? [{
      href: '/order-history', 
      label: 'Order History',
      hasDropdown: false
    }] : []),
    { 
      href: '/about', 
      label: 'About',
      hasDropdown: false
    },
    { 
      href: '/contact', 
      label: 'Contact',
      hasDropdown: false
    },
    { 
      href: '/support', 
      label: 'Support',
      hasDropdown: true,
      dropdownItems: [
        { href: '/support', label: 'Help Center', icon: '❓' },
        { href: '/support#faq', label: 'FAQ', icon: '📋' },
        { href: '/contact', label: 'Contact Us', icon: '📞' },
        { href: '/privacy', label: 'Privacy Policy', icon: '🔒' },
        { href: '/terms', label: 'Terms of Service', icon: '📄' }
      ]
    }
  ];

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

  const handleSignIn = () => {
    signIn('google', { 
      callbackUrl: '/profile',
      prompt: 'select_account' // Always show account selection
    });
  };

  const handleAccountSwitch = () => {
    setShowAccountSwitcher(true);
  };

  const handleMobileDropdownToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus on search input when opening
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    } else {
      // Clear search when closing
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleProductClick = (productId) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/products/${productId}`);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <img
                src="/BA-SportsLogo.png"
                alt="BA Sports"
                className="h-20 w-auto object-contain"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(index)}
                  onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
                  onClick={() => {
                    console.log('Navigating to:', link.href);
                    if (!link.hasDropdown) {
                      // Close mobile menu if open
                      setIsMenuOpen(false);
                    }
                  }}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 flex items-center space-x-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                    router.pathname === link.href
                      ? 'text-blue-600 bg-blue-50/50'
                      : isScrolled 
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-100/50' 
                        : 'text-white hover:text-blue-200 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <FiChevronDown 
                      size={14} 
                      className={`transition-transform duration-200 ${
                        activeDropdown === index ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                  {router.pathname === link.href && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}
                </Link>

                {/* Modern Dropdown Menu */}
                {link.hasDropdown && (
                  <AnimatePresence>
                    {activeDropdown === index && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onMouseEnter={() => setActiveDropdown(index)}
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden"
                        style={{
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        {/* Dropdown Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
                          <h3 className="text-sm font-semibold text-gray-800">
                            {link.label}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {link.label === 'Products' ? 'Browse by category' : 'Quick access'}
                          </p>
                        </div>

                        {/* Dropdown Items */}
                        <div className="py-2">
                          {link.dropdownItems.map((item, itemIndex) => (
                            <motion.div
                              key={item.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: itemIndex * 0.05 }}
                            >
                              <Link
                                href={item.href}
                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group/item focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg mx-2"
                                onClick={() => {
                                  console.log('Navigating to dropdown item:', item.href);
                                  setActiveDropdown(null);
                                  // Close mobile menu if open
                                  setIsMenuOpen(false);
                                }}
                              >
                                <span className="text-lg mr-3 group-hover/item:scale-110 transition-transform duration-200">
                                  {item.icon}
                                </span>
                                <span className="font-medium group-hover/item:text-blue-600 transition-colors duration-200">
                                  {item.label}
                                </span>
                                <motion.div
                                  className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"
                                  initial={{ x: -5 }}
                                  whileHover={{ x: 0 }}
                                >
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </motion.div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>

                        {/* Dropdown Footer */}
                        <div className="px-4 py-2 bg-gradient-to-r from-gray-50/50 to-blue-50/50 border-t border-white/10">
                          <Link
                            href={link.href}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center w-full py-1"
                            onClick={() => setActiveDropdown(null)}
                          >
                            View all {link.label.toLowerCase()}
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearchToggle}
              className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                isSearchOpen
                  ? 'bg-blue-600 text-white'
                  : isScrolled 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-white hover:bg-white/20'
              }`}
            >
              <FiSearch size={20} />
            </motion.button>

            {/* User menu */}
            {user ? (
              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className={`p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                    isScrolled 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {uploadedProfileImage ? (
                    <img
                      src={uploadedProfileImage}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser size={20} />
                  )}
                </motion.button>
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-white/20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      {uploadedProfileImage ? (
                        <img
                          src={uploadedProfileImage}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {hasMultipleAccounts && (
                          <p className="text-xs text-blue-600 font-medium">
                            {otherAccounts.length + 1} accounts
                          </p>
                        )}
                      </div>
                      {isLoading && (
                        <FiRefreshCw className="text-blue-500 animate-spin" size={16} />
                      )}
                    </div>
                  </div>

                  {/* Account Switching */}
                  {hasMultipleAccounts && (
                    <>
                      <button
                        onClick={handleAccountSwitch}
                        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span className="flex items-center">
                          <FiUser className="mr-3" size={16} />
                          Switch Account
                        </span>
                        <FiChevronDown size={14} />
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                    </>
                  )}
                  <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FiUser className="mr-3" size={16} />
                    My Profile
                  </Link>
                  
                  <Link href="/cart" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FiShoppingCart className="mr-3" size={16} />
                    My Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="mr-3 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignIn}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                    isScrolled 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                  title="Sign in with Google"
                >
                  <span className="flex items-center space-x-2">
                    <FiUser size={16} />
                    <span className="hidden sm:inline">Sign In</span>
                  </span>
                </motion.button>
              </div>
            )}

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartToggle}
              className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <FiShoppingCart size={20} />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Search Modal/Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              data-search-modal
              className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl border-t border-white/20"
              style={{ 
                zIndex: 9999,
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="max-w-4xl mx-auto p-6">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      id="search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for products, categories..."
                      className="w-full px-4 py-3 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={20} />
                      </button>
                    )}
                  </div>
                </form>

                {/* Search Results */}
                {searchQuery && (
                  <div className="mt-4">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-600">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {searchResults.map((product) => (
                            <motion.div
                              key={product.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => handleProductClick(product.id)}
                              className="flex items-center space-x-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:bg-white/90 cursor-pointer transition-all duration-200"
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-500 capitalize">
                                  {typeof product.category === 'object' ? product.category.name : product.category}
                                </p>
                                <p className="text-sm font-semibold text-blue-600">
                                  ${product.price}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        {allProducts.filter(product => {
                          // Extract category name whether it's an object or string
                          const categoryName = typeof product.category === 'object' 
                            ? product.category.name 
                            : product.category;
                          
                          return (
                            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
                          );
                        }).length > 6 && (
                          <div className="mt-4 text-center">
                            <button
                              onClick={handleSearchSubmit}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              See all results for "{searchQuery}"
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiSearch className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500">No products found for "{searchQuery}"</p>
                        <p className="text-sm text-gray-400 mt-1">Try searching with different keywords</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Categories */}
                {!searchQuery && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Browse Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.slice(0, 6).map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchOpen(false);
                            router.push(`/products?category=${encodeURIComponent(category.name)}`);
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
                        >
                          <span>{getCategoryIcon(category.name)}</span>
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-md rounded-lg mt-2 py-4"
            >
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="px-4 py-2">
                    {link.hasDropdown ? (
                      <div
                        className={`block text-gray-700 hover:bg-gray-100 rounded-md py-2 px-3 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                          router.pathname === link.href ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                        onClick={() => handleMobileDropdownToggle(index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleMobileDropdownToggle(index);
                          }
                        }}
                        tabIndex={0}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{link.label}</span>
                          <FiChevronDown 
                            size={16} 
                            className={`transition-transform duration-200 ${
                              activeDropdown === index ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className={`block text-gray-700 hover:bg-gray-100 rounded-md py-2 px-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                          router.pathname === link.href ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{link.label}</span>
                        </div>
                      </Link>
                    )}

                    {/* Mobile Dropdown Items */}
                    {link.hasDropdown && (
                      <AnimatePresence>
                        {activeDropdown === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-6 mt-2 space-y-1"
                          >
                            {link.dropdownItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setActiveDropdown(null);
                                }}
                              >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Switcher Modal */}
      <AccountSwitcher 
        isOpen={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
      />
    </motion.nav>
  );
};

export default Navbar;