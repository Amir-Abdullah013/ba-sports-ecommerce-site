import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiX,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiShoppingBag
} from 'react-icons/fi';
import Layout from '../components/Layout';

// Memoized API function to fetch user orders
const getUserOrders = async (userId, userEmail) => {
  try {
    // Try to fetch by userId first if available
    if (userId) {
      const response = await fetch(`/api/orders?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // If orders found, return them
        if (data.orders && data.orders.length > 0) {
          return data;
        }
      }
    }
    
    // If no userId or no orders found by userId, try by email
    if (userEmail) {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch orders by email: ${response.status} - ${errorText}`);
      }
    }
    
    // If neither userId nor email worked, return empty result
    return { orders: [] };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

const OrderHistory = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  // Memoized function to link orders to user
  const linkOrdersToUser = useCallback(async (userId, email) => {
    try {
      const response = await fetch('/api/orders/link-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Failed to link orders');
      }
    } catch (error) {
      console.error('Error linking orders:', error);
      return { linkedCount: 0, error: error.message };
    }
  }, []);

  // Optimized loadOrders function
  const loadOrders = useCallback(async () => {
    if (!session?.user?.id && !session?.user?.email) {
      setError('No user ID or email found in session');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Execute both API calls in parallel
      const [linkResult, ordersResponse] = await Promise.allSettled([
        session?.user?.id && session?.user?.email 
          ? linkOrdersToUser(session.user.id, session.user.email) 
          : Promise.resolve({ linkedCount: 0 }),
        getUserOrders(session.user.id, session.user.email)
      ]);
      
      if (ordersResponse.status === 'fulfilled') {
        setOrders(ordersResponse.value.orders || []);
        setLastUpdate(new Date());
      } else {
        throw ordersResponse.reason;
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(`Failed to load orders: ${error.message}`);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, session?.user?.email, linkOrdersToUser]);

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(query) ||
        order.items?.some(item => 
          item.product?.name?.toLowerCase().includes(query) ||
          item.product?.sku?.toLowerCase().includes(query)
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchQuery, statusFilter]);

  // Load orders on session change
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      loadOrders();
    }
  }, [status, session?.user?.id, loadOrders, router]);

  // Memoized status functions
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'DELIVERED': return FiCheckCircle;
      case 'SHIPPED': return FiTruck;
      case 'PROCESSING': return FiPackage;
      case 'PENDING': return FiClock;
      case 'CANCELLED': return FiX;
      default: return FiClock;
    }
  }, []);

  const formatStatusDisplay = useCallback((status) => {
    switch (status) {
      case 'DELIVERED': return 'Delivered';
      case 'SHIPPED': return 'Shipped';
      case 'PROCESSING': return 'Processing';
      case 'PENDING': return 'Pending';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }, []);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  }, []);

  const openOrderModal = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }, []);

  const closeOrderModal = useCallback(() => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('All');
  }, []);

  const retryLoadOrders = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  const statusOptions = useMemo(() => 
    ['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], 
    []
  );

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white">Loading your orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Order History - BA Sports" description="View your order history and track your purchases">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold mb-4">Your Order History</h1>
              <p className="text-blue-100 text-xl">
                Track and manage your purchases
              </p>
              {lastUpdate && (
                <p className="text-blue-200 text-sm mt-2">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Filter Orders</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-white/60">
                  {filteredOrders.length} of {orders.length} orders
                </div>
                {(searchQuery || statusFilter !== 'All') && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/80 mb-2">Search Orders</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search orders, products, or SKUs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/60"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Filter by Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-w-[150px] appearance-none cursor-pointer"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status} className="bg-gray-800 text-white">
                        {status === 'All' ? 'All Orders' : formatStatusDisplay(status)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiFilter className="text-white/60" size={16} />
                  </div>
                </div>
              </div>
              {session?.user?.id && session?.user?.email && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Actions</label>
                  <button
                    onClick={() => linkOrdersToUser(session.user.id, session.user.email)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Link Orders
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Orders Grid */}
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <FiX size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Error Loading Orders</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={retryLoadOrders}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiShoppingBag size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {isLoading ? 'Loading orders...' : 'No orders found'}
              </h3>
              <p className="text-gray-300">
                {isLoading ? 'Please wait while we fetch your orders' : 'Try adjusting your search or filter criteria'}
              </p>
              {!isLoading && session?.user?.id && session?.user?.email && (
                <button
                  onClick={() => linkOrdersToUser(session.user.id, session.user.email)}
                  className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Link My Orders
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">Order {order.orderNumber}</h3>
                            <p className="text-white/60 text-sm">Placed {formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon size={16} className="text-gray-600" />
                            <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                              {formatStatusDisplay(order.status)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3 mb-4">
                          {order.items?.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <img
                                src={item.product?.image || '/api/placeholder/60/60'}
                                alt={item.product?.name || 'Product'}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/60/60';
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-white font-medium">{item.product?.name || 'Product'}</p>
                                {item.product?.sku && (
                                  <p className="text-xs text-white/60">SKU: {item.product.sku}</p>
                                )}
                                <p className="text-sm text-white/80">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</p>
                              </div>
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="text-center text-white/60 text-sm">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-white/20 pt-4 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Total:</span>
                            <span className="text-white font-bold text-lg">{formatPrice(order.total)}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
                          >
                            <FiEye size={16} />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        <AnimatePresence>
          {showOrderModal && selectedOrder && (
            <OrderModal 
              selectedOrder={selectedOrder} 
              onClose={closeOrderModal}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              formatStatusDisplay={formatStatusDisplay}
              formatPrice={formatPrice}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

// Extracted Modal Component for better performance
const OrderModal = React.memo(({ 
  selectedOrder, 
  onClose, 
  getStatusColor, 
  getStatusIcon, 
  formatStatusDisplay, 
  formatPrice 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-5xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <FiShoppingBag className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Order Details
                </h2>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-white/70">Order #{selectedOrder.orderNumber}</span>
                  <span className="text-sm text-blue-400 font-medium">ID: {selectedOrder.id}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="space-y-8">
            {/* Order Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FiCalendar className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Order Date</p>
                    <p className="text-white font-semibold">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <FiDollarSign className="text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Total Amount</p>
                    <p className="text-white font-bold text-lg">{formatPrice(selectedOrder.total)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    {(() => {
                      const StatusIcon = getStatusIcon(selectedOrder.status);
                      return <StatusIcon className="text-purple-400" size={20} />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {formatStatusDisplay(selectedOrder.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FiMapPin className="text-blue-400" size={20} />
                <span>Shipping Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Shipping Address</p>
                    <p className="text-white font-medium">{selectedOrder.shippingAddress || 'No address provided'}</p>
                  </div>
                  {selectedOrder.shippingCity && (
                    <div>
                      <p className="text-sm text-white/60 mb-1">City</p>
                      <p className="text-white">{selectedOrder.shippingCity}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedOrder.trackingNumber && (
                    <div>
                      <p className="text-sm text-white/60 mb-1">Tracking Number</p>
                      <p className="text-white font-mono bg-white/10 px-3 py-1 rounded-lg">
                        {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  )}
                  {selectedOrder.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-white/60 mb-1">Estimated Delivery</p>
                      <p className="text-white">
                        {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <FiPackage className="text-green-400" size={20} />
                <span>Order Items ({selectedOrder.items?.length || 0})</span>
              </h3>
              <div className="space-y-4">
                {selectedOrder.items?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={item.product?.image || '/api/placeholder/80/80'}
                        alt={item.product?.name || 'Product'}
                        className="w-20 h-20 object-cover rounded-xl shadow-lg"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/80/80';
                        }}
                      />
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-lg truncate">
                        {item.product?.name || 'Product'}
                      </h4>
                      {item.product?.sku && (
                        <p className="text-sm text-white/60 font-mono">SKU: {item.product.sku}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-white/80">Qty: {item.quantity}</span>
                        <span className="text-white/80">Price: {formatPrice(item.price)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-white/60">Total</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal:</span>
                  <span>{formatPrice(selectedOrder.subtotal || selectedOrder.total)}</span>
                </div>
                {selectedOrder.shipping && parseFloat(selectedOrder.shipping) > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>Shipping:</span>
                    <span>{formatPrice(selectedOrder.shipping)}</span>
                  </div>
                )}
                {selectedOrder.tax && parseFloat(selectedOrder.tax) > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>Tax:</span>
                    <span>{formatPrice(selectedOrder.tax)}</span>
                  </div>
                )}
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

OrderModal.displayName = 'OrderModal';

export default OrderHistory;