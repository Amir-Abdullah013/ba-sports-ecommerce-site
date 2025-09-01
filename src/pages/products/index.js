/**
 * PERFORMANCE OPTIMIZED: Products Page (User Frontend)
 * 
 * Key optimizations:
 * - Paginated product loading
 * - Debounced search
 * - Loading skeletons
 * - Efficient filtering
 * - Cached API responses
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiX, FiChevronLeft, FiChevronRight, FiLoader, FiShoppingCart } from 'react-icons/fi';
import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import Toast from '../../components/Toast';

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All'); // NEW: Brand filter state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // PERFORMANCE: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  
  // CART FUNCTIONALITY: Toast and cart state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  const animationContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // PERFORMANCE: Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      loadProducts(1, query, selectedCategory, selectedBrand, sortBy, sortOrder);
    }, 300);
  }, [selectedCategory, selectedBrand, sortBy, sortOrder]);

  // Load categories from database
  const loadCategories = useCallback(async () => {
    try {
      console.log('🏷️ Loading categories from database...');
      const response = await fetch('/api/categories?active=true');
      
      if (response.ok) {
        const data = await response.json();
        const categoryNames = ['All', ...data.categories.map(cat => cat.name)];
        console.log(`✅ Loaded ${data.categories?.length || 0} categories:`, categoryNames);
        setCategories(categoryNames);
      } else {
        console.error('❌ Failed to load categories:', response.status);
        setCategories(['All']);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories(['All']);
    }
  }, []);

  // PERFORMANCE: Optimized product loading with pagination
  const loadProducts = useCallback(async (page = 1, search = '', category = 'All', brand = 'All', sort = 'createdAt', order = 'desc') => {
    try {
      const isFirstLoad = page === 1;
      if (isFirstLoad) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      console.log(`🔍 Loading products: page=${page}, search="${search}", category="${category}", brand="${brand}"`);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(category !== 'All' && { category }),
        ...(brand !== 'All' && { brand }),
        sortBy: sort,
        sortOrder: order
      });

      const startTime = Date.now();
      const response = await fetch(`/api/products?${params}`);
      const loadTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        setProducts(isFirstLoad ? data.products : prev => [...prev, ...data.products]);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
        setHasNextPage(data.pagination.hasNextPage);
        setResponseTime(loadTime);
        
        console.log(`✅ Products loaded: ${data.products.length} items in ${loadTime}ms`);
        
              // Categories are loaded separately now
      } else {
        console.error('❌ Failed to load products:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // PERFORMANCE: Initial load
  useEffect(() => {
    loadProducts(1, searchQuery, selectedCategory, selectedBrand, sortBy, sortOrder);
    loadCategories();
  }, [selectedCategory, selectedBrand, sortBy, sortOrder, loadCategories, loadProducts]);

  // PERFORMANCE: Debounced search effect
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedSearch]);

  // PERFORMANCE: Memoized filtered products (client-side filtering for current page)
  const displayProducts = useMemo(() => {
    return products; // Server-side filtering, no client filtering needed
  }, [products]);

  // PERFORMANCE: Load more function for pagination
  const loadMoreProducts = useCallback(() => {
    if (!isLoadingMore && hasNextPage) {
      loadProducts(currentPage + 1, searchQuery, selectedCategory, selectedBrand, sortBy, sortOrder);
    }
  }, [currentPage, hasNextPage, isLoadingMore, searchQuery, selectedCategory, selectedBrand, sortBy, sortOrder, loadProducts]);

  // CART FUNCTIONALITY: Add to cart handler with feedback
  const handleAddToCart = useCallback((product) => {
    try {
      // Get current cart from localStorage
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if product already exists
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity
        currentCart[existingItemIndex].quantity += 1;
        setToastMessage(`Updated ${product.name} quantity in cart`);
      } else {
        // Add new item
        currentCart.push({
          ...product,
          quantity: 1,
          addedAt: new Date().toISOString()
        });
        setToastMessage(`${product.name} added to cart!`);
      }
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(currentCart));
      
      // Trigger cart update in parent Layout
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success toast
      setToastType('success');
      setShowToast(true);
      
      console.log(`✅ Added to cart: ${product.name}`);
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      setToastMessage('Failed to add item to cart');
      setToastType('error');
      setShowToast(true);
    }
  }, []);

  // PERFORMANCE: Product Card Skeleton Component
  const ProductSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-64 bg-gray-300"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
      </div>
      </div>
    );

  return (
    <Layout title={`Products - BA Sports`}>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Unified with Homepage Design */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Premium Sports Equipment
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Discover our complete collection of high-quality sports gear and equipment
              </p>
              
              {/* Stats display with improved styling */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{totalCount}</span>
                  <span>Products Available</span>
                </div>
                {responseTime > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">⚡</span>
                    <span>Loaded in {responseTime}ms</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
            </div>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Brand Filter Tabs */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="inline-flex bg-white rounded-xl shadow-lg p-2 border">
                <button
                  onClick={() => setSelectedBrand('All')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    selectedBrand === 'All'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setSelectedBrand('BA_SPORTS')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    selectedBrand === 'BA_SPORTS'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  BA Sports
                </button>
                <button
                  onClick={() => setSelectedBrand('OTHER')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    selectedBrand === 'OTHER'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Other Brands
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                    placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                  {/* Sort */}
                  <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(direction);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FiGrid />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FiList />
                  </button>
                </div>
              </div>
                        </div>
                      </div>

          {/* Products Grid */}
          <div ref={animationContainerRef}>
                {isLoading ? (
              // PERFORMANCE: Loading skeletons
              <div className={`grid gap-6 ${
                      viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1'
              }`}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
                          </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <FiSearch className="w-16 h-16 mx-auto" />
                        </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedBrand('All'); // NEW: Reset brand filter
                      }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                </button>
              </div>
                ) : (
              <>
                  <motion.div
                    layout
                  className={`grid gap-6 ${
                            viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                              : 'grid-cols-1'
                          }`}
                >
                  <AnimatePresence>
                    {displayProducts.map((product) => (
                              <motion.div
                                key={product.id}
                                layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                                  <ProductCard
                                    product={product}
                          viewMode={viewMode}
                          onAddToCart={handleAddToCart}
                                  />
                              </motion.div>
                    ))}
                          </AnimatePresence>
                        </motion.div>

                {/* PERFORMANCE: Load More / Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 text-center">
                    {hasNextPage ? (
                      <button
                        onClick={loadMoreProducts}
                        disabled={isLoadingMore}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                      >
                        {isLoadingMore ? (
                          <>
                            <FiLoader className="w-4 h-4 animate-spin" />
                            <span>Loading more...</span>
                          </>
                        ) : (
                          <>
                            <span>Load More Products</span>
                            <FiChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="text-gray-600">
                        Showing all {totalCount} products
                      </p>
                    )}
                    </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* CART FUNCTIONALITY: Toast Notifications */}
        <Toast
          show={showToast}
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      </div>
    </Layout>
  );
};

export default ProductsPage;