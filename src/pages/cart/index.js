import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import Layout from '../../components/Layout';

const CartPage = () => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Layout title="Shopping Cart - BA Sports" description="Review your selected items and proceed to checkout">
      {(cartActions) => {
        const { cartItems, updateCartQuantity, removeFromCart, getCartTotal } = cartActions;
        const subtotal = getCartTotal();
        const shipping = subtotal > 50 ? 0 : 9.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="relative text-white py-16 overflow-hidden">
              {/* Floating shopping elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating shopping bags */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`bag-${i}`}
                    className="absolute w-10 h-10 opacity-20"
                    style={{
                      left: `${15 + (i * 20) % 70}%`,
                      top: `${20 + (i * 25) % 60}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 10, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 5 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 1.2
                    }}
                  >
                    <FiShoppingBag size={40} className="text-blue-300/30" />
                  </motion.div>
                ))}
                
                {/* Floating plus/minus icons */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`icon-${i}`}
                    className="absolute w-6 h-6 opacity-25"
                    style={{
                      left: `${60 + (i * 15) % 30}%`,
                      top: `${30 + (i * 20) % 40}%`,
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.25, 0.4, 0.25],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 1.5
                    }}
                  >
                    {i % 2 === 0 ? (
                      <FiPlus size={24} className="text-green-400" />
                    ) : (
                      <FiMinus size={24} className="text-red-400" />
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    Shopping Cart
                  </h1>
                  <p className="text-xl text-blue-100">
                    Review your items and proceed to checkout
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {!cartItems || cartItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-32 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiShoppingBag size={60} className="text-white/60" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Your cart is empty
                  </h2>
                  <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
                    Looks like you haven't added anything to your cart yet. 
                    Let's change that!
                  </p>
                  <Link href="/products">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 mx-auto"
                    >
                      <span>Start Shopping</span>
                      <FiArrowRight />
                    </motion.button>
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6"
                    >
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Cart Items ({cartItems?.length || 0})
                      </h2>
                      
                      <div className="space-y-6">
                        <AnimatePresence>
                          {cartItems?.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -100 }}
                              className="flex items-center space-x-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:shadow-md hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                            >
                              {/* Product Image */}
                              <div className="w-24 h-24 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                  src={item.image || '/api/placeholder/96/96'}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/api/placeholder/96/96';
                                  }}
                                />
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <Link href={`/products/${item.id}`}>
                                  <h3 className="font-semibold text-white hover:text-blue-600 transition-colors cursor-pointer">
                                    {item.name}
                                  </h3>
                                </Link>
                                <p className="text-sm text-white/70 mb-2">
                                  {typeof item.category === 'object' ? item.category.name : item.category}
                                </p>
                                <p className="text-lg font-bold text-white">
                                  {formatPrice(item.price)}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-3">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors text-white/80 backdrop-blur-sm"
                                >
                                  <FiMinus size={14} />
                                </motion.button>
                                
                                <span className="w-12 text-center font-semibold text-white">
                                  {item.quantity}
                                </span>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors text-white/80 backdrop-blur-sm"
                                >
                                  <FiPlus size={14} />
                                </motion.button>
                              </div>

                              {/* Item Total */}
                              <div className="text-right">
                                <p className="font-bold text-lg text-white">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>

                              {/* Remove Button */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FiTrash2 size={18} />
                              </motion.button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </div>

                  {/* Order Summary */}
                  <div className="lg:col-span-1">
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 sticky top-8"
                    >
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Order Summary
                      </h2>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-white/80">
                          <span>Subtotal:</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        
                        <div className="flex justify-between text-white/80">
                          <span>Shipping:</span>
                          <span>
                            {shipping === 0 ? (
                              <span className="text-green-400 font-medium">Free</span>
                            ) : (
                              formatPrice(shipping)
                            )}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-white/80">
                          <span>Tax:</span>
                          <span>{formatPrice(tax)}</span>
                        </div>
                        
                        <div className="border-t border-white/20 pt-4">
                          <div className="flex justify-between text-xl font-bold text-white">
                            <span>Total:</span>
                            <span>{formatPrice(total)}</span>
                          </div>
                        </div>
                      </div>

                      {shipping > 0 && (
                        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
                          <p className="text-sm text-blue-300">
                            Add {formatPrice(50 - subtotal)} more to get free shipping!
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Link href="/checkout">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            <span>Proceed to Checkout</span>
                            <FiArrowRight />
                          </motion.button>
                        </Link>
                        
                        <Link href="/products">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 border-2 border-white/30 text-white/90 rounded-xl font-medium hover:border-blue-400 hover:text-blue-400 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                          >
                            Continue Shopping
                          </motion.button>
                        </Link>
                      </div>

                      {/* Trust Indicators */}
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-center space-x-4 text-sm text-white/70">
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 bg-green-500 rounded-full" />
                            <span>Secure Checkout</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 bg-blue-500 rounded-full" />
                            <span>Free Returns</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </Layout>
  );
};

export default CartPage;
