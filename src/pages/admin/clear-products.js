import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { FiTrash2, FiAlertTriangle, FiCheck, FiRefreshCw } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { getProducts, deleteProduct, clearAllProducts, resetProducts } from '../../lib/api';

const ClearProducts = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

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
      
      loadProducts();
    }
  }, [session, status, router]);

  const loadProducts = async () => {
    try {
      const productData = await getProducts();
      setProducts(productData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllProductsHandler = async () => {
    if (!window.confirm('Are you sure you want to delete ALL products? This action cannot be undone!')) {
      return;
    }

    setIsDeleting(true);
    setDeletedCount(0);

    try {
      // Use the new clearAllProducts function
      clearAllProducts();
      await loadProducts();
      alert('All products cleared successfully!');
    } catch (error) {
      console.error('Error clearing products:', error);
      alert('Error clearing products. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetToInitialProducts = async () => {
    if (!window.confirm('Are you sure you want to reset products to initial state? This will replace all current products with the default ones.')) {
      return;
    }

    try {
      resetProducts();
      await loadProducts();
      alert('Products reset to initial state successfully!');
    } catch (error) {
      console.error('Error resetting products:', error);
      alert('Error resetting products. Please try again.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Clear Products - Admin" description="Clear all products">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Clear Products - Admin" description="Clear all products">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">Manage Products</h1>
              <p className="text-red-100 text-xl">
                Clear, reset, or manage your product inventory
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Clear All Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FiAlertTriangle className="text-red-600" size={24} />
                <h2 className="text-xl font-bold text-red-900">Clear All Products</h2>
              </div>
              <p className="text-red-800 mb-4">
                This action will permanently delete ALL products from your store. This cannot be undone.
              </p>
              <div className="bg-red-100 rounded-lg p-4 mb-4">
                <p className="text-red-900 font-semibold">
                  Total Products to Delete: <span className="text-2xl">{products.length}</span>
                </p>
              </div>
              <button
                onClick={clearAllProductsHandler}
                disabled={isDeleting || products.length === 0}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 size={20} />
                    <span>Clear All Products</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Reset to Initial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FiRefreshCw className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-blue-900">Reset to Initial</h2>
              </div>
              <p className="text-blue-800 mb-4">
                Reset all products to the initial default state. This will replace current products with the original mock data.
              </p>
              <div className="bg-blue-100 rounded-lg p-4 mb-4">
                <p className="text-blue-900 font-semibold">
                  Current Products: <span className="text-2xl">{products.length}</span>
                </p>
              </div>
              <button
                onClick={resetToInitialProducts}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <FiRefreshCw size={20} />
                <span>Reset to Initial</span>
              </button>
            </motion.div>
          </div>

          {/* Products List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Current Products</h2>
              <p className="text-gray-600">These products will be affected by the actions above</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image || '/api/placeholder/60/60'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/60/60';
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {typeof product.category === 'object' ? product.category.name : product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${
                          product.stock <= 5 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <FiCheck className="text-green-500 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">All products have been cleared!</p>
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => router.push('/admin/products')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Back to Manage Products
            </button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ClearProducts;
