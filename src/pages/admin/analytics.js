/**
 * PRODUCTION-READY: Admin Analytics Dashboard
 * 
 * Features:
 * - Real database data only (no mock data)
 * - Performance optimized queries
 * - Real-time analytics updates
 * - Responsive design
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiRefreshCw
} from 'react-icons/fi';
import Layout from '../../components/Layout';

const AdminAnalytics = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
    productsGrowth: 0,
    monthlyRevenue: [],
    topProducts: [],
    recentOrders: [],
    userGrowth: [],
    dataSource: 'loading'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session) {
      // Check admin access
      const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
      const isAdminRole = session.user.role === 'ADMIN';
      
      if (!isAdminEmail && !isAdminRole) {
        router.push('/');
        return;
      }
      
      loadAnalytics();
    }
  }, [session, status, router]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Loading real analytics data...');
      
      const response = await fetch('/api/admin/analytics');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setAnalytics(data);
          setLastUpdated(new Date().toLocaleString());
          console.log(`✅ Analytics loaded from ${data.dataSource}`);
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const formatGrowth = (growth) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <FiTrendingUp className="w-4 h-4 mr-1" /> : <FiTrendingDown className="w-4 h-4 mr-1" />}
        {Math.abs(growth).toFixed(1)}% from last month
      </span>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Analytics - Admin" description="View detailed analytics and insights">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Analytics - Admin" description="View detailed analytics and insights">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-4">Analytics Dashboard</h1>
                  <p className="text-blue-100 text-xl">
                    Real-time insights from your live database
                  </p>
                  {lastUpdated && (
                    <p className="text-blue-200 text-sm mt-2">
                      Last updated: {lastUpdated} | Data source: {analytics.dataSource}
                    </p>
                  )}
                </div>
                <button
                  onClick={loadAnalytics}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <span className="font-semibold mr-2">⚠️ Error:</span>
                <span>{error}</span>
                <button
                  onClick={loadAnalytics}
                  className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(analytics.totalRevenue)}
                  </p>
                  <div className="text-sm font-medium mt-1">
                    {formatGrowth(analytics.revenueGrowth)}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <FiDollarSign size={24} className="text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.totalOrders.toLocaleString()}
                  </p>
                  <div className="text-sm font-medium mt-1">
                    {formatGrowth(analytics.ordersGrowth)}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                  <FiShoppingCart size={24} className="text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.totalUsers.toLocaleString()}
                  </p>
                  <div className="text-sm font-medium mt-1">
                    {formatGrowth(analytics.usersGrowth)}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <FiUsers size={24} className="text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.totalProducts.toLocaleString()}
                  </p>
                  <div className="text-sm font-medium mt-1">
                    {formatGrowth(analytics.productsGrowth)}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                  <FiPackage size={24} className="text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Monthly Revenue</h2>
                <FiBarChart2 className="text-blue-600" size={24} />
              </div>
              {analytics.monthlyRevenue.length > 0 ? (
                <div className="space-y-4">
                  {analytics.monthlyRevenue.slice(-6).map((data) => {
                    const maxRevenue = Math.max(...analytics.monthlyRevenue.map(d => d.revenue));
                    const percentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <div key={`${data.month}-${data.year}`} className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">{data.month} {data.year}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-900 font-semibold">
                            {formatPrice(data.revenue)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({data.orders} orders)
                          </span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiBarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No revenue data available</p>
                </div>
              )}
            </motion.div>

            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Top Products</h2>
                <FiPieChart className="text-green-600" size={24} />
              </div>
              {analytics.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{product.totalSold} sold</p>
                        <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiPieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No product sales data available</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
              <FiCalendar className="text-purple-600" size={24} />
            </div>
            {analytics.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Order Number</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {order.orderNumber || `#${order.id.slice(-8)}`}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-600">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent orders found</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;