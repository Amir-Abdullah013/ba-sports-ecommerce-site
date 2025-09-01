import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiFilter,
  FiSave,
  FiX,
  FiUpload,
  FiImage,
  FiLoader,
  FiRefreshCw,
  FiStar,
  FiCamera
} from 'react-icons/fi';

const AdminProducts = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);
  
  // PERFORMANCE: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    sku: '',
    image: '',
    images: [],
    tags: [],
    rating: 0,
    brandType: 'BA_SPORTS', // NEW: Brand type field
    isActive: true,
    isFeatured: false
  });

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

      // Load data with error handling
      loadProducts();
      loadCategories();
    }
  }, [session, status, router]);

  // Simple retry mechanism for database connection issues
  useEffect(() => {
    if (products.length === 0 && !isLoading && status === 'authenticated') {
      // If no products loaded and we're authenticated, try again after 3 seconds
      const timer = setTimeout(() => {
        console.log('Retrying products load...');
        loadProducts();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [products.length, isLoading, status]);

  // PERFORMANCE: Optimized product loading with pagination
  const loadProducts = async (page = 1, search = '', category = 'All') => {
    try {
      setIsLoading(page === 1);
      setError(null);
      
      console.log(`🔍 Loading admin products: page=${page}, search="${search}"`);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
        ...(category !== 'All' && { category })
      });

      const startTime = Date.now();
      const response = await fetch(`/api/admin/products?${params}`);
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ Admin API response: ${response.status} in ${loadTime}ms`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 Admin products loaded: ${data.products?.length || 0} items`);
        
        setProducts(data.products || []);
        
        if (data.pagination) {
          setCurrentPage(data.pagination.currentPage);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        }
      } else {
        console.error('❌ Failed to load admin products:', response.status);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Error loading admin products:', error);
      setError('Network error. Please check your connection.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('🏷️ Loading categories from database...');
      const response = await fetch('/api/categories?active=true');
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Loaded ${data.categories?.length || 0} categories`);
        setCategories(data.categories || []);
      } else {
        console.error('❌ Failed to load categories:', response.status);
        setCategories([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      console.log('Opening edit modal for product:', product);
      setEditingProduct(product);
      // Handle category properly
      const productCategory = typeof product.category === 'object' ? product.category.name : product.category;
      // Handle images properly - if it's a string, try to parse it
      let productImages = Array(3).fill('');
      if (product.images) {
        try {
          if (typeof product.images === 'string') {
            productImages = JSON.parse(product.images);
          } else if (Array.isArray(product.images)) {
            productImages = product.images;
          }
          // Ensure we have exactly 3 slots for images
          while (productImages.length < 3) {
            productImages.push('');
          }
          productImages = productImages.slice(0, 3);
        } catch (e) {
          console.error('Error parsing product images:', e);
          productImages = Array(3).fill('');
        }
      }
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: productCategory || '',
        stock: product.stock || '',
        sku: product.sku || '',
        image: product.image || '',
        images: productImages,
        tags: product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : [],
        rating: parseFloat(product.rating) || 0,
        brandType: product.brandType || 'BA_SPORTS', // NEW: Handle brand type
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured !== undefined ? product.isFeatured : false
      });
    } else {
      console.log('Opening add modal');
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        stock: '',
        sku: '',
        image: '',
        images: Array(3).fill(''),
        tags: [],
        rating: 0,
        brandType: 'BA_SPORTS', // NEW: Default brand type
        isActive: true,
        isFeatured: false
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      stock: '',
      sku: '',
      image: '',
      images: Array(3).fill(''),
      tags: [],
      rating: 0,
      brandType: 'BA_SPORTS', // NEW: Reset brand type
      isActive: true,
      isFeatured: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.stock || !formData.category || !formData.brandType) {
        throw new Error('Please fill in all required fields including brand type');
      }

      // Validate price and stock are positive numbers
      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);
      
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a positive number');
      }
      
      if (isNaN(stock) || stock < 0) {
        throw new Error('Stock must be a non-negative number');
      }

      // Validate at least one image is uploaded
      const validImages = formData.images.filter(img => img !== '');
      if (validImages.length === 0) {
        throw new Error('Please upload at least one product image');
      }

      // Create a clean request body
      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: formData.category,
        stock: stock,
        sku: formData.sku.trim() || '',
        image: validImages[0] || '', // Use first image as main image
        images: validImages,
        tags: formData.tags || [],
        rating: parseFloat(formData.rating) || 0,
        brandType: formData.brandType, // NEW: Include brand type
        isActive: formData.isActive,
        isFeatured: formData.isFeatured
      };

      console.log('Form data:', formData);
      console.log('Request body:', requestBody);

      // Use different methods for create vs update
      let url, method;
      
      if (editingProduct) {
        // For editing, use PUT method with ID in URL
        url = `/api/admin/products?id=${editingProduct.id}`;
        method = 'PUT';
      } else {
        // For creating, use POST method
        url = '/api/admin/products';
        method = 'POST';
      }

      console.log('Sending request:', { url, method, requestBody, editingProduct: editingProduct?.id });

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('Response status:', response.status);

      if (response.ok) {
        console.log('Product saved successfully');
        await loadProducts();
        closeModal();
        setSuccessMessage(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.log('Product save failed, status:', response.status);
        
        // Show error message
        try {
          const responseText = await response.text();
          console.log('Error response text:', responseText);
          if (responseText && responseText.trim()) {
            const errorData = JSON.parse(responseText);
            console.log('Parsed error data:', errorData);
            setError(errorData.error || `Failed to ${editingProduct ? 'update' : 'create'} product`);
          } else {
            setError(`Unable to ${editingProduct ? 'update' : 'create'} product. Please try again later.`);
          }
        } catch (parseError) {
          console.log('Error parsing response:', parseError);
          setError(`Unable to ${editingProduct ? 'update' : 'create'} product. Please try again later.`);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      // Handle network errors gracefully
      if (error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    setError(null);
    
    try {
      console.log('Deleting product:', productToDelete.id);
      console.log('Product to delete:', productToDelete);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const deleteUrl = `/api/admin/products?id=${productToDelete.id}`;
      console.log('Delete URL:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', response.headers);

      if (response.ok) {
        console.log('Product deleted successfully');
        await loadProducts();
        setShowDeleteModal(false);
        setProductToDelete(null);
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else if (response.status === 404) {
        // Product not found - remove from local state anyway
        console.log('Product not found, removing from local state');
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
        setShowDeleteModal(false);
        setProductToDelete(null);
        setSuccessMessage('Product removed from list (was already deleted)');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.log('Product delete failed, status:', response.status);
        
        // Try to get detailed error message
        try {
          const responseText = await response.text();
          console.log('Delete error response text:', responseText);
          
          if (responseText && responseText.trim()) {
            const errorData = JSON.parse(responseText);
            console.log('Parsed delete error data:', errorData);
            
            // Handle specific error cases
            if (response.status === 404) {
              setError('Product not found. It may have been already deleted.');
            } else if (response.status === 403) {
              setError('You do not have permission to delete this product.');
            } else if (response.status === 503) {
              setError('Database connection issue. Please try again later.');
            } else {
              setError(errorData.error || 'Unable to delete product. Please try again later.');
            }
          } else {
            setError('Unable to delete product. Please try again later.');
          }
        } catch (parseError) {
          console.log('Error parsing delete response:', parseError);
          setError('Unable to delete product. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        setError('Delete request timed out. Please try again.');
      } else if (error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to delete product. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleImageUpload = (index) => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.index = index;
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB for better performance)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size must be less than 2MB');
      return;
    }

    const index = parseInt(e.target.dataset.index);
    setUploadingImage(index);
    setError(null);

    // Optimize image before converting to base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 800px width/height)
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with reduced quality
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      const newImages = [...formData.images];
      newImages[index] = optimizedDataUrl;
      
      setFormData({
        ...formData,
        images: newImages,
        image: index === 0 ? optimizedDataUrl : formData.image
      });
      setUploadingImage(null);
    };

    img.onerror = () => {
      setError('Failed to process image file');
      setUploadingImage(null);
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (event) => {
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setUploadingImage(null);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages[index] = '';
    setFormData({ ...formData, images: newImages });
  };

  const handleRatingChange = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <FiStar className="w-5 h-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>
        );
      } else {
        stars.push(<FiStar key={i} className="w-5 h-5 text-gray-300" />);
      }
    }

    return stars;
  };

  const renderInteractiveStars = (rating, onChange) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFull = i <= Math.floor(rating);
      const isHalf = i === Math.floor(rating) + 1 && rating % 1 >= 0.5;
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={(e) => {
            // Show hover effect
            const star = e.currentTarget;
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400', 'fill-current');
          }}
          onMouseLeave={(e) => {
            // Restore original state
            const star = e.currentTarget;
            if (i <= Math.floor(rating) || (i === Math.floor(rating) + 1 && rating % 1 >= 0.5)) {
              star.classList.add('text-yellow-400', 'fill-current');
              star.classList.remove('text-gray-300');
            } else {
              star.classList.remove('text-yellow-400', 'fill-current');
              star.classList.add('text-gray-300');
            }
          }}
          className="p-1 focus:outline-none transition-colors"
        >
          <FiStar
            className={`w-6 h-6 ${
              isFull || isHalf
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      );
    }
    return stars;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const productCategory = typeof product.category === 'object' ? product.category.name : product.category;
    const matchesCategory = selectedCategory === 'All' || productCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (status === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Products - Admin">
      <div className="min-h-screen bg-gray-50">
        {/* Error Alert */}
        {error && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
            >
              <div className="flex items-center">
                <span className="block sm:inline mr-3">⚠️</span>
                <span className="block sm:inline">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="absolute top-0 right-0 p-2"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative"
            >
              <div className="flex items-center">
                <span className="block sm:inline mr-3">✅</span>
                <span className="block sm:inline">{successMessage}</span>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="absolute top-0 right-0 p-2"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Database Connection Warning - Only show for specific database errors */}
        {error && error.includes('database connection') && (
          <div className="fixed top-20 right-4 z-50 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg"
            >
              <div className="flex items-center">
                <span className="block sm:inline mr-3">🔧</span>
                <span className="block sm:inline text-sm">
                  Database connection issue. Please check your environment variables and database status.
                </span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold mb-4">Manage Products</h1>
                <p className="text-blue-100 text-xl">
                  Add, edit, and manage your product inventory
                </p>
              </div>
              <div className="flex space-x-3">
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal()}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <FiPlus />
                  <span>Add Product</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, description, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {categories.length === 0 ? (  
                <option value="" disabled>No categories found - Click "Add Categories" to add default categories</option>
              ) : (
                categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Products Grid */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Brand</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Rating</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
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
                            {product.sku && (
                              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {product.category ? (typeof product.category === 'object' ? product.category.name : product.category) : 'No Category'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          product.brandType === 'BA_SPORTS' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {product.brandType === 'BA_SPORTS' ? 'BA Sports' : 'Other Brands'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">${product.price}</div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {renderStars(parseFloat(product.rating) || 0)}
                          <span className="ml-1 text-sm text-gray-600">
                            ({parseFloat(product.rating || 0).toFixed(1)})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FiEdit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(product)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiImage className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedCategory !== 'All' 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first product to get started'
                  }
                </p>
                <button
                  onClick={loadProducts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 rounded-lg transition-colors bg-red-500 text-white hover:bg-red-600"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter SKU"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a category</option>
                        {categories.length === 0 ? (
                          <option value="" disabled>No categories found - Please add categories first</option>
                        ) : (
                          categories.map(category => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Type *
                      </label>
                      <select
                        required
                        value={formData.brandType}
                        onChange={(e) => setFormData({ ...formData, brandType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="BA_SPORTS">BA Sports</option>
                        <option value="OTHER">Other Brands</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderInteractiveStars(formData.rating, handleRatingChange)}
                        </div>
                        <div className="flex items-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={formData.rating}
                            onChange={(e) => handleRatingChange(parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="ml-1 text-sm text-gray-600">/5</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images (At least 1 required)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div
                            className={`h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                              image ? '' : 'border-gray-300 hover:border-blue-400'
                            }`}
                            onClick={() => handleImageUpload(index)}
                          >
                            {uploadingImage === index ? (
                              <div className="text-center">
                                <FiLoader className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Uploading...</p>
                              </div>
                            ) : image ? (
                              <>
                                <img
                                  src={image}
                                  alt={`Product preview ${index + 1}`}
                                  className="h-full w-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                  <FiCamera className="w-6 h-6 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="text-center">
                                <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Click to upload</p>
                              </div>
                            )}
                          </div>
                          {image && (
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Upload at least 1 image for your product. The first image will be used as the main product image.
                    </p>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 flex-shrink-0">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiSave />
                      )}
                      <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={cancelDelete}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <FiTrash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>

                {productToDelete && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={productToDelete.image || '/api/placeholder/60/60'}
                        alt={productToDelete.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/60/60';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{productToDelete.name}</p>
                        <p className="text-sm text-gray-500">
                          {productToDelete.category ? (typeof productToDelete.category === 'object' ? productToDelete.category.name : productToDelete.category) : 'No Category'}
                        </p>
                        <p className="text-sm text-gray-500">${productToDelete.price}</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-semibold">{productToDelete?.name}</span>? 
                  This product will be permanently removed from your inventory.
                </p>

                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 />
                    )}
                    <span>{isDeleting ? 'Deleting...' : 'Delete Product'}</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default AdminProducts;
  