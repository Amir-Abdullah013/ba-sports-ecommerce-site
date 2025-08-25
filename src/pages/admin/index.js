import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiTrendingUp, 
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiEye,
  FiPlus
} from 'react-icons/fi';
import Layout from '../../components/Layout';
import { getProducts, getUsers, getOrders } from '../../lib/api';

const AdminDashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session) {
      // Check if user is admin by email (bypass role check)
      const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
      const isAdminRole = session.user.role === 'ADMIN';
      
      if (!isAdminEmail && !isAdminRole) {
        router.push('/');
        return;
      }
      
      setUser(session.user);
      loadDashboardData();
    }
  }, [session, status, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [products, users, orders] = await Promise.all([
        getProducts(),
        getUsers(),
        getOrders()
      ]);

      // Calculate total revenue safely
      const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = parseFloat(order.total) || 0;
        return sum + orderTotal;
      }, 0);
      
      console.log('Dashboard data loaded:', {
        products: products?.length || 0,
        users: users?.length || 0,
        orders: orders?.length || 0,
        totalRevenue
      });
      
      setStats({
        totalProducts: products?.length || 0,
        totalUsers: users?.filter(u => u.role !== 'ADMIN')?.length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue: totalRevenue || 0
      });

      // Set recent orders safely
      const recent = orders?.slice(-5).reverse() || [];
      setRecentOrders(recent);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values on error
      setStats({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0
      });
      setRecentOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: FiDollarSign,
      color: 'from-green-500 to-emerald-600',
      change: stats.totalRevenue > 0 ? 'Active' : 'No sales yet'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      change: stats.totalOrders > 0 ? `${stats.totalOrders} orders` : 'No orders yet'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'from-purple-500 to-violet-600',
      change: stats.totalProducts > 0 ? `${stats.totalProducts} products` : 'No products yet'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'from-orange-500 to-red-600',
      change: stats.totalUsers > 0 ? `${stats.totalUsers} customers` : 'No customers yet'
    }
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Add a new product to your inventory',
      icon: FiPlus,
      href: '/admin/products',
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders and shipping',
      icon: FiShoppingBag,
      href: '/admin/orders',
      color: 'from-green-500 to-teal-600'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: FiUsers,
      href: '/admin/users',
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed sales analytics',
      icon: FiTrendingUp,
      href: '/admin/analytics',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Admin Dashboard - BA Sports" description="Admin dashboard for BA Sports">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Loading Admin Dashboard...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard - BA Sports" description="Manage your sports equipment store">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold mb-4">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-blue-100 text-xl">
                Here's what's happening with your store today
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {card.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {card.value}
                        </p>
                        <p className="text-sm text-green-600 font-medium mt-1">
                          {card.change} from last month
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                        <IconComponent size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Link key={action.title} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <IconComponent size={20} className="text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Recent Orders
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {recentOrders.length} most recent orders
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadDashboardData}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 font-medium p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Refresh orders"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>
                  <Link href="/admin/orders">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>View All</span>
                      <FiEye size={16} />
                    </motion.button>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading recent orders...</p>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <FiShoppingCart size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent orders</h3>
                    <p className="text-gray-600">Orders will appear here once customers start placing them</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => window.open(`/admin/orders?order=${order.id}`, '_blank')}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              #{order.id}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              Order #{order.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </p>
                            {order.user && (
                              <p className="text-xs text-gray-500">
                                Customer: {order.user.name || order.user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-lg">
                          {formatPrice(order.total || 0)}
                        </p>
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status || 'pending')}`}>
                          {order.status || 'pending'}
                        </span>
                        {order.items && (
                          <p className="text-xs text-gray-500 mt-1">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Additional Dashboard Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Store Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.totalOrders > 0 ? 'Active' : 'New'}
                </div>
                <div className="text-gray-600">Store Status</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.totalProducts}
                </div>
                <div className="text-gray-600">Available Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.totalUsers}
                </div>
                <div className="text-gray-600">Registered Customers</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;


