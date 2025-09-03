import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiEye, FiEdit, FiTrash2, FiRefreshCw, FiMapPin, FiPhone, FiMail, FiUser } from 'react-icons/fi';
import Layout from '../../components/Layout';

const AdminOrdersPage = () => {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      window.location.href = '/auth/signin';
      return;
    }

    const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
    if (!isAdminEmail && session.user.role !== 'ADMIN') {
      window.location.href = '/';
      return;
    }
  }, [session, status]);

  const loadOrders = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      console.log('loadOrders called with:', { page, search, status });
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(status !== 'all' && { status })
      });
      console.log('API request params:', params.toString());

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      console.log('Admin orders API response:', data);
      console.log('Total count received:', data.totalCount);
      console.log('Orders count:', data.orders?.length);
      console.log('Orders statuses:', data.orders?.map(o => ({ id: o.id, status: o.status, orderNumber: o.orderNumber })));

      if (response.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        // Use orders.length as fallback if totalCount is 0 but orders exist
        const finalTotalCount = data.totalCount || (data.orders?.length > 0 ? data.orders.length : 0);
        setTotalCount(finalTotalCount);
        setCurrentPage(page);
        console.log('State updated - totalCount:', finalTotalCount, 'orders.length:', data.orders?.length);
        
        // Debug status counts
        if (data.orders?.length > 0) {
          const statusCounts = data.orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {});
          console.log('Status counts:', statusCounts);
        }
      } else {
        setError(data.error || 'Failed to load orders');
      }
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadOrders(currentPage, searchTerm, statusFilter);
    }
  }, [session, currentPage, searchTerm, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      console.log('Updating order status:', { orderId, newStatus });
      const response = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Order status updated successfully:', data);
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        // Clear any previous errors
        setError(null);
      } else {
        const data = await response.json();
        console.error('Failed to update order status:', data);
        setError(data.error || 'Failed to update order status');
      }
    } catch (err) {
      setError('Failed to update order status');
      console.error('Error updating order:', err);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-500 bg-yellow-500/10';
      case 'CONFIRMED': return 'text-cyan-500 bg-cyan-500/10';
      case 'PROCESSING': return 'text-blue-500 bg-blue-500/10';
      case 'SHIPPED': return 'text-purple-500 bg-purple-500/10';
      case 'DELIVERED': return 'text-green-500 bg-green-500/10';
      case 'CANCELLED': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <FiPackage className="w-4 h-4" />;
      case 'CONFIRMED': return <FiCheckCircle className="w-4 h-4" />;
      case 'PROCESSING': return <FiRefreshCw className="w-4 h-4" />;
      case 'SHIPPED': return <FiTruck className="w-4 h-4" />;
      case 'DELIVERED': return <FiCheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <FiXCircle className="w-4 h-4" />;
      default: return <FiPackage className="w-4 h-4" />;
    }
  };

  if (status === 'loading') {
    return (
      <Layout title="Admin Orders - BA Sports">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout title="Admin Orders - BA Sports">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Order Management</h1>
            <p className="text-white/60">Manage and track all customer orders</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{totalCount}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {orders.length} loaded
                  </p>
                </div>
                <FiPackage className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {orders.filter(o => o.status === 'PENDING').length}
                  </p>
                </div>
                <FiPackage className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Processing</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {orders.filter(o => o.status === 'PROCESSING').length}
                  </p>
                </div>
                <FiRefreshCw className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Shipped</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {orders.filter(o => o.status === 'SHIPPED').length}
                  </p>
                </div>
                <FiTruck className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Delivered</p>
                  <p className="text-2xl font-bold text-green-400">
                    {orders.filter(o => o.status === 'DELIVERED').length}
                  </p>
                </div>
                <FiCheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Search Orders</label>
                <input
                  type="text"
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="all" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Statuses</option>
                  <option value="PENDING" style={{ backgroundColor: '#1f2937', color: 'white' }}>Pending</option>
                  <option value="CONFIRMED" style={{ backgroundColor: '#1f2937', color: 'white' }}>Confirmed</option>
                  <option value="PROCESSING" style={{ backgroundColor: '#1f2937', color: 'white' }}>Processing</option>
                  <option value="SHIPPED" style={{ backgroundColor: '#1f2937', color: 'white' }}>Shipped</option>
                  <option value="DELIVERED" style={{ backgroundColor: '#1f2937', color: 'white' }}>Delivered</option>
                  <option value="CANCELLED" style={{ backgroundColor: '#1f2937', color: 'white' }}>Cancelled</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => loadOrders(1, searchTerm, statusFilter)}
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4 inline mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>

          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden"
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-white">Loading orders...</div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-400">{error}</div>
                <button
                  onClick={() => loadOrders(currentPage, searchTerm, statusFilter)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-white/60">No orders found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-white/60 font-medium">Order #</th>
                      <th className="px-6 py-4 text-left text-white/60 font-medium">Customer</th>
                      <th className="px-6 py-4 text-left text-white/60 font-medium">Items</th>
                      <th className="px-6 py-4 text-left text-white/60 font-medium">Total</th>
                      <th className="px-6 py-4 text-left text-white/60 font-medium">Status</th>
                      <th className="px-6 py-4 text-left text-white/60 font-medium">Date</th>
                      <th className="px-6 py-4 text-left text-white/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                      >
                        <td className="px-6 py-4 text-white font-medium">{order.orderNumber}</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-white font-medium">{order.customerName}</div>
                            <div className="text-white/60 text-sm">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 text-white font-medium">
                          ${order.total?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <FiEye className="w-4 h-4 inline mr-1" />
                              View
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                console.log('Status change for order', order.id, 'from', order.status, 'to', e.target.value);
                                handleStatusUpdate(order.id, e.target.value);
                              }}
                              disabled={updatingOrder === order.id}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 cursor-pointer min-w-[140px] hover:bg-white/20 transition-colors"
                              style={{ 
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.75rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.25em 1.25em',
                                paddingRight: '2.5rem'
                              }}
                            >
                              <option value="PENDING" style={{ backgroundColor: '#1f2937', color: 'white' }}>Pending</option>
                              <option value="CONFIRMED" style={{ backgroundColor: '#1f2937', color: 'white' }}>Confirmed</option>
                              <option value="PROCESSING" style={{ backgroundColor: '#1f2937', color: 'white' }}>Processing</option>
                              <option value="SHIPPED" style={{ backgroundColor: '#1f2937', color: 'white' }}>Shipped</option>
                              <option value="DELIVERED" style={{ backgroundColor: '#1f2937', color: 'white' }}>Delivered</option>
                              <option value="CANCELLED" style={{ backgroundColor: '#1f2937', color: 'white' }}>Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-center"
            >
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <FiXCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FiPackage className="w-5 h-5 mr-2" />
                      Order Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Order Number:</span>
                        <span className="text-white font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1">{selectedOrder.status}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Payment Method:</span>
                        <span className="text-white">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Total Amount:</span>
                        <span className="text-white font-medium">${selectedOrder.total?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Order Date:</span>
                        <span className="text-white">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FiUser className="w-5 h-5 mr-2" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <FiUser className="w-4 h-4 text-white/60 mr-2" />
                        <span className="text-white font-medium">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center">
                        <FiMail className="w-4 h-4 text-white/60 mr-2" />
                        <span className="text-white">{selectedOrder.customerEmail}</span>
                      </div>
                      {selectedOrder.customerPhone && (
                        <div className="flex items-center">
                          <FiPhone className="w-4 h-4 text-white/60 mr-2" />
                          <span className="text-white">{selectedOrder.customerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FiMapPin className="w-5 h-5 mr-2" />
                      Shipping Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedOrder.shippingAddress && (
                        <div>
                          <span className="text-white/60">Address:</span>
                          <p className="text-white">{selectedOrder.shippingAddress}</p>
                        </div>
                      )}
                      {selectedOrder.shippingCity && (
                        <div className="flex justify-between">
                          <span className="text-white/60">City:</span>
                          <span className="text-white">{selectedOrder.shippingCity}</span>
                        </div>
                      )}
                      {selectedOrder.shippingState && (
                        <div className="flex justify-between">
                          <span className="text-white/60">State/Province:</span>
                          <span className="text-white">{selectedOrder.shippingState}</span>
                        </div>
                      )}
                      {selectedOrder.shippingZipCode && (
                        <div className="flex justify-between">
                          <span className="text-white/60">ZIP Code:</span>
                          <span className="text-white">{selectedOrder.shippingZipCode}</span>
                        </div>
                      )}
                      {selectedOrder.shippingCountry && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Country:</span>
                          <span className="text-white">{selectedOrder.shippingCountry}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {item.product?.image && (
                              <img 
                                src={item.product.image} 
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <p className="text-white font-medium">{item.product?.name || 'Product'}</p>
                              <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">${item.price?.toFixed(2) || '0.00'}</p>
                            <p className="text-white/60 text-sm">Total: ${item.total?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default AdminOrdersPage;
