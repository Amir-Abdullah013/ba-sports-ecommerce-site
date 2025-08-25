import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../hooks/useWishlist';
import Link from 'next/link';

const WishlistPage = () => {
  const { data: session } = useSession();
  const { wishlist, removeFromWishlist, loading, error } = useWishlist();
  const [removingItem, setRemovingItem] = useState(null);

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingItem(productId);
    const success = await removeFromWishlist(productId);
    setRemovingItem(null);
    
    if (success) {
      // Optional: Show success message
      console.log('Removed from wishlist');
    }
  };

  if (!session) {
    return (
      <Layout title="Wishlist - BA Sports" description="Your saved products">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-6">
              <FiHeart size={64} className="mx-auto text-white/60 mb-4" />
              <h1 className="text-3xl font-bold text-white mb-4">Sign in to view your wishlist</h1>
              <p className="text-white/60 mb-8">
                Create an account or sign in to save your favorite products
              </p>
            </div>
            <Link href="/auth/signin">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Wishlist - BA Sports" description="Your saved products">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <button className="flex items-center space-x-2 text-white/60 hover:text-blue-400 transition-colors">
                    <FiArrowLeft />
                    <span>Back to Home</span>
                  </button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
                  <p className="text-white/60">
                    {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-white/60">Loading your wishlist...</div>
            </div>
          )}

          {/* Empty Wishlist */}
          {!loading && wishlist.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="mb-6">
                <FiHeart size={64} className="mx-auto text-white/60 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Your wishlist is empty</h2>
                <p className="text-white/60 mb-8">
                  Start browsing our products and save your favorites
                </p>
              </div>
              <Link href="/products">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
                  Browse Products
                </button>
              </Link>
            </motion.div>
          )}

          {/* Wishlist Items */}
          {!loading && wishlist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {wishlist.map((wishlistItem, index) => (
                <motion.div
                  key={wishlistItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <ProductCard
                    product={wishlistItem.product}
                    onAddToCart={() => {}} // Will be handled by ProductCard
                  />
                  
                  {/* Remove from wishlist button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveFromWishlist(wishlistItem.product.id)}
                    disabled={removingItem === wishlistItem.product.id}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                      removingItem === wishlistItem.product.id
                        ? 'bg-gray-500 text-white opacity-50 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                    }`}
                  >
                    <FiTrash2 size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Clear All Button */}
          {!loading && wishlist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your entire wishlist?')) {
                    wishlist.forEach(item => removeFromWishlist(item.product.id));
                  }
                }}
                className="px-6 py-3 border-2 border-white/20 bg-white/10 backdrop-blur-xl text-white rounded-xl hover:border-red-400 hover:text-red-400 transition-colors"
              >
                Clear All Items
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;
