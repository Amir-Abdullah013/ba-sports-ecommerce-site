import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getProducts, addProduct, clearAllProducts, resetProducts } from '../../lib/api';
import { useProductsSync } from '../../hooks/useProductsSync';

const TestSync = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');

  const loadProducts = async () => {
    console.log('🔄 Test page loading products...');
    try {
      const productData = await getProducts();
      setProducts(productData);
      setLastUpdate(new Date().toLocaleTimeString());
      console.log('✅ Test page loaded', productData.length, 'products');
    } catch (error) {
      console.error('❌ Test page error loading products:', error);
    }
  };

  // Use the synchronization hook
  useProductsSync(loadProducts);

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

  const handleAddTestProduct = async () => {
    const testProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'This is a test product for synchronization',
      price: Math.random() * 100,
      category: 'Football',
      stock: Math.floor(Math.random() * 50),
      rating: Math.random() * 5,
      image: '/api/placeholder/300/300',
      images: ['/api/placeholder/300/300', '/api/placeholder/300/300', '/api/placeholder/300/300']
    };

    try {
      await addProduct(testProduct);
      console.log('✅ Test product added');
    } catch (error) {
      console.error('❌ Error adding test product:', error);
    }
  };

  const handleClearProducts = async () => {
    try {
      await clearAllProducts();
      console.log('✅ All products cleared');
    } catch (error) {
      console.error('❌ Error clearing products:', error);
    }
  };

  const handleResetProducts = async () => {
    try {
      resetProducts();
      console.log('✅ Products reset');
    } catch (error) {
      console.error('❌ Error resetting products:', error);
    }
  };

  if (status === 'loading') {
    return (
      <Layout title="Test Sync - Admin" description="Test product synchronization">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Test Sync - Admin" description="Test product synchronization">
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Synchronization Test</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAddTestProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Test Product
              </button>
              <button
                onClick={handleClearProducts}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear All Products
              </button>
              <button
                onClick={handleResetProducts}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Reset to Mock Data
              </button>
              <button
                onClick={loadProducts}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Refresh Products
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Current Products ({products.length})</h2>
              <p className="text-sm text-gray-600">Last updated: {lastUpdate}</p>
            </div>
            
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-600 ml-2">${product.price}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {product.id} | Stock: {product.stock} | Rating: {product.rating}
                  </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <p className="text-gray-500 text-center py-8">No products found</p>
              )}
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p>Open this page in multiple tabs to test synchronization.</p>
            <p>Check the browser console for detailed synchronization logs.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestSync;





