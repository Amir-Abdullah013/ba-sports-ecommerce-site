// src/lib/api.js

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Users
const mockUsers = [
  {
    id: 1,
    name: "Amir Abdullah",
    email: "amir@example.com",
    role: "admin",
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    role: "customer",
  },
];

// Mock Orders
const mockOrders = [
  
];

// Initial Mock Products
const initialMockProducts = [
  
];

// Storage keys
const USERS_STORAGE_KEY = "ecommerce_users";
const ORDERS_STORAGE_KEY = "ecommerce_orders";
const PRODUCTS_STORAGE_KEY = "ecommerce_products"; // Add products storage key

// ---------------------
// User Storage Helpers
// ---------------------

const getStoredUsers = () => {
  if (typeof window === "undefined") return mockUsers;

  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
      return mockUsers;
    }
  } catch (error) {
    console.error("Error reading users from localStorage:", error);
    return mockUsers;
  }
};

const setStoredUsers = (users) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error writing users to localStorage:", error);
  }
};

// ---------------------
// Order Storage Helpers
// ---------------------

const getStoredOrders = () => {
  if (typeof window === "undefined") return mockOrders;

  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(mockOrders));
      return mockOrders;
    }
  } catch (error) {
    console.error("Error reading orders from localStorage:", error);
    return mockOrders;
  }
};

const setStoredOrders = (orders) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Error writing orders to localStorage:", error);
  }
};

// ---------------------
// Product Storage Helpers - ADD THESE FUNCTIONS
// ---------------------

const getStoredProducts = () => {
  if (typeof window === "undefined") return initialMockProducts;

  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialMockProducts));
      return initialMockProducts;
    }
  } catch (error) {
    console.error("Error reading products from localStorage:", error);
    return initialMockProducts;
  }
};

const setStoredProducts = (products) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Error writing products to localStorage:", error);
  }
};

// ---------------------
// API Functions
// ---------------------

export const getUsers = async () => {
  return getStoredUsers();
};

export const addUser = async (user) => {
  const users = getStoredUsers();
  const newUser = { id: Date.now(), ...user };
  const updatedUsers = [...users, newUser];
  setStoredUsers(updatedUsers);
  return newUser;
};

export const getOrders = async () => {
  return getStoredOrders();
};

export const addOrder = async (order) => {
  const orders = getStoredOrders();
  const newOrder = { id: Date.now(), ...order };
  const updatedOrders = [...orders, newOrder];
  setStoredOrders(updatedOrders);
  return newOrder;
};

// Database API call function (assuming this exists elsewhere)
const callDatabaseAPI = async (endpoint, options = {}) => {
  // This is a placeholder - you'll need to implement your actual database API call
  console.log('Calling database API:', endpoint);
  throw new Error('Database API not implemented'); // Simulate database failure for fallback
};

// Helper function to normalize product data format
const normalizeProduct = (product) => {
  console.log('🔧 Normalizing product:', product);
  
  let categoryName;
  if (typeof product.category === 'object' && product.category !== null) {
    categoryName = product.category.name || 'Unknown';
  } else if (typeof product.category === 'string') {
    categoryName = product.category;
  } else {
    categoryName = 'Unknown';
  }

  const normalized = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    category: categoryName,
    stock: parseInt(product.stock) || 0,
    rating: product.rating ? parseFloat(product.rating) : 0,
    image: product.image || '/api/placeholder/300/300',
    images: product.images || [],
    featured: product.isFeatured || product.featured || false,
    slug: product.slug || product.name?.toLowerCase().replace(/\s+/g, '-'),
    isActive: product.isActive !== false,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
  
  console.log('✅ Normalized product:', normalized);
  return normalized;
};

// Products API
export const getProducts = async (category = 'All') => {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    const products = data.products || [];
    
    console.log('📊 Retrieved', products.length, 'products from public API');
    
    if (category === 'All') {
      return products;
    }
    return products.filter(product => {
      const productCategory = typeof product.category === 'object' ? product.category.name : product.category;
      return productCategory === category;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProduct = async (id) => {
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const data = await response.json();
    return data.product || data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Admin-specific product functions
export const getAdminProducts = async () => {
  try {
    const response = await fetch('/api/admin/products');
    if (!response.ok) {
      throw new Error('Failed to fetch admin products');
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return [];
  }
};

export const getFeaturedProducts = async () => {
  await delay(400);
  
  try {
    // Try to get from database first
    const products = await callDatabaseAPI('');
    console.log('📊 Database: Retrieved featured products');
    const normalizedProducts = products.map(normalizeProduct);
    return normalizedProducts.filter(product => product.featured);
  } catch (error) {
    console.log('⚠️ Database unavailable, using localStorage fallback');
    const products = getStoredProducts();
    return products.filter(product => product.featured);
  }
};

export const searchProducts = async (query) => {
  await delay(600);
  
  try {
    // Try to get from database first
    const products = await callDatabaseAPI('');
    console.log('📊 Database: Searching products');
    const normalizedProducts = products.map(normalizeProduct);
    return normalizedProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.log('⚠️ Database unavailable, using localStorage fallback');
    const products = getStoredProducts();
    return products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Admin API - Now uses database
export const addProduct = async (productData) => {
  await delay(600);
  
  try {
    // Try to add to database first
    const newProduct = await callDatabaseAPI('', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    
    console.log('✅ Database: Product added successfully:', newProduct.id);
    
    // Normalize the new product
    const normalizedProduct = normalizeProduct(newProduct);
    
    // Update localStorage for user pages
    const products = getStoredProducts();
    products.push(normalizedProduct);
    setStoredProducts(products);
    
    return normalizedProduct;
  } catch (error) {
    console.log('⚠️ Database unavailable, using localStorage fallback');
    
    // Fallback to localStorage
    const products = getStoredProducts();
    
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      ...productData,
      stock: parseInt(productData.stock),
      price: parseFloat(productData.price),
      rating: parseFloat(productData.rating) || 0,
      featured: false,
      images: productData.images || [
        productData.image || '/api/placeholder/300/300?text=Product+1',
        '/api/placeholder/300/300?text=Product+2',
        '/api/placeholder/300/300?text=Product+3'
      ]
    };
    
    products.push(newProduct);
    setStoredProducts(products);
    console.log('✅ localStorage: Product added successfully:', newProduct.id);
    return newProduct;
  }
};

export const updateProduct = async (id, productData) => {
  await delay(500);
  
  try {
    // Try to update in database first
    const updatedProduct = await callDatabaseAPI(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    
    console.log('✅ Database: Product updated successfully:', updatedProduct.id);
    
    // Normalize the updated product
    const normalizedProduct = normalizeProduct(updatedProduct);
    
    // Update localStorage for user pages
    const products = getStoredProducts();
    const productIndex = products.findIndex(product => product.id === parseInt(id));
    if (productIndex !== -1) {
      products[productIndex] = normalizedProduct;
      setStoredProducts(products);
    }
    
    return normalizedProduct;
  } catch (error) {
    console.log('⚠️ Database unavailable, using localStorage fallback');
    
    // Fallback to localStorage
    const products = getStoredProducts();
    const productIndex = products.findIndex(product => product.id === parseInt(id));
    
    if (productIndex !== -1) {
      products[productIndex] = { 
        ...products[productIndex], 
        ...productData,
        stock: parseInt(productData.stock),
        price: parseFloat(productData.price),
        rating: parseFloat(productData.rating) || products[productIndex].rating
      };
      setStoredProducts(products);
      console.log('✅ localStorage: Product updated successfully:', products[productIndex].id);
      return products[productIndex];
    }
    return null;
  }
};

export const deleteProduct = async (id) => {
  await delay(400);
  
  try {
    // Try to delete from database first
    await callDatabaseAPI(`/${id}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Database: Product deleted successfully:', id);
    
    // Update localStorage for user pages
    const products = getStoredProducts();
    const productIndex = products.findIndex(product => product.id === parseInt(id));
    
    if (productIndex !== -1) {
      const deletedProduct = products.splice(productIndex, 1)[0];
      setStoredProducts(products);
      console.log('✅ localStorage: Product deleted successfully:', deletedProduct.id);
      return deletedProduct;
    }
    return null;
  } catch (error) {
    console.log('⚠️ Database unavailable, using localStorage fallback');
    
    // Fallback to localStorage
    const products = getStoredProducts();
    const productIndex = products.findIndex(product => product.id === parseInt(id));
    
    if (productIndex !== -1) {
      const deletedProduct = products.splice(productIndex, 1)[0];
      setStoredProducts(products);
      console.log('✅ localStorage: Product deleted successfully:', deletedProduct.id);
      return deletedProduct;
    }
    return null;
  }
};

// Utility function to reset products to initial state
export const resetProducts = () => {
  setStoredProducts(initialMockProducts);
  console.log('Products reset to initial state');
};

// Utility function to clear all products
export const clearAllProducts = () => {
  setStoredProducts([]);
  console.log('All products cleared');
};