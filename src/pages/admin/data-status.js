import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { FiDatabase, FiRefreshCw, FiTrash2, FiCheck } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { getProducts, getUsers, getOrders, resetProducts, clearAllProducts } from '../../lib/api';

const DataStatus = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [data, setData] = useState({
    products: [],
    users: [],
    orders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session) {
      const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
      const isAdminRole = session.user.role === 'ADMIN';
      
      if (!isAdminEmail && !isAdminRole) {
        router.push('/');
        return;
      }
      
      loadData();
    }
  }, [session, status, router]);

  const loadData = async () => {
    try {
      const [products, users, orders] = await Promise.all([
        getProducts(),
        getUsers(),
        getOrders()
      ]);
      
      setData({ products, users, orders });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllData = async () => {
    if (!window.confirm('Are you sure you want to reset all data to initial state?')) {
      return;
    }

    try {
      resetProducts();
      await loadData();
      alert('Data reset successfully!');
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Error resetting data');
    }
  };

  const clearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This cannot be undone!')) {
      return;
    }

    try {
      clearAllProducts();
      await loadData();
      alert('All data cleared successfully!');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data');
    }
  };

  const getLocalStorageInfo = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const products = localStorage.getItem('ba_sports_products');
      const users = localStorage.getItem('ba_sports_users');
      const orders = localStorage.getItem('ba_sports_orders');
      
      return {
        products: products ? JSON.parse(products).length : 0,
        users: users ? JSON.parse(users).length : 0,
        orders: orders ? JSON.parse(orders).length : 0,
        hasData: !!(products || users || orders)
      };
    } catch (error) {
      return null;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Data Status - Admin" description="Check data status">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const storageInfo = getLocalStorageInfo();

  return (
    <Layout title="Data Status - Admin" description="Check data status">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">Data Status</h1>
              <p className="text-blue-100 text-xl">
                Check the current state of your application data
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Data Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FiDatabase className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Products</h2>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {data.products.length}
              </div>
              <p className="text-gray-600">Total products in store</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FiDatabase className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Users</h2>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {data.users.length}
              </div>
              <p className="text-gray-600">Registered users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FiDatabase className="text-purple-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Orders</h2>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {data.orders.length}
              </div>
              <p className="text-gray-600">Total orders</p>
            </motion.div>
          </div>

          {/* Storage Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Local Storage Status</h2>
            {storageInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiCheck className="text-blue-600" size={20} />
                    <span className="font-semibold text-blue-900">Products</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {storageInfo.products}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiCheck className="text-green-600" size={20} />
                    <span className="font-semibold text-green-900">Users</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-2">
                    {storageInfo.users}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiCheck className="text-purple-600" size={20} />
                    <span className="font-semibold text-purple-900">Orders</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mt-2">
                    {storageInfo.orders}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiCheck className="text-gray-600" size={20} />
                    <span className="font-semibold text-gray-900">Status</span>
                  </div>
                  <div className="text-sm font-bold text-gray-600 mt-2">
                    {storageInfo.hasData ? 'Active' : 'Empty'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Unable to read localStorage data</p>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <button
              onClick={resetAllData}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <FiRefreshCw size={20} />
              <span>Reset to Initial Data</span>
            </button>
            <button
              onClick={clearAllData}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <FiTrash2 size={20} />
              <span>Clear All Data</span>
            </button>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <button
              onClick={() => router.push('/admin/products')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Back to Manage Products
            </button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default DataStatus;





