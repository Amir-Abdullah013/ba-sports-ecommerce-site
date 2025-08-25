import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getProducts, addProduct, clearAllProducts, resetProducts } from '../../lib/api';

const DatabaseStatus = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [databaseStatus, setDatabaseStatus] = useState('Checking...');
  const [lastUpdate, setLastUpdate] = useState('');

  const loadProducts = async () => {
    console.log('🔄 Database status page loading products...');
    try {
      const productData = await getProducts();
      setProducts(productData);
      setLastUpdate(new Date().toLocaleTimeString());
      setDatabaseStatus('Connected');
      console.log('✅ Database status page loaded', productData.length, 'products');
    } catch (error) {
      console.error('❌ Database status page error:', error);
      setDatabaseStatus('Error: ' + error.message);
    }
  };

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

  const handleTestDatabase = async () => {
    const testProduct = {
      name: `Database Test Product ${Date.now()}`,
      description: 'This is a test product to verify database synchronization',
      price: Math.random() * 100,
      category: 'Football',
      stock: Math.floor(Math.random() * 50),
      rating: Math.random() * 5,
      image: '/api/placeholder/300/300',
      images: ['/api/placeholder/300/300', '/api/placeholder/300/300', '/api/placeholder/300/300']
    };

    try {
      setDatabaseStatus('Testing...');
      await addProduct(testProduct);
      await loadProducts();
      setDatabaseStatus('Test successful!');
      console.log('✅ Database test successful');
    } catch (error) {
      setDatabaseStatus('Test failed: ' + error.message);
      console.error('❌ Database test failed:', error);
    }
  };

  const handleClearProducts = async () => {
    try {
      setDatabaseStatus('Clearing...');
      await clearAllProducts();
      await loadProducts();
      setDatabaseStatus('Products cleared');
      console.log('✅ Products cleared');
    } catch (error) {
      setDatabaseStatus('Clear failed: ' + error.message);
      console.error('❌ Clear failed:', error);
    }
  };

  const handleResetProducts = async () => {
    try {
      setDatabaseStatus('Resetting...');
      resetProducts();
      await loadProducts();
      setDatabaseStatus('Products reset');
      console.log('✅ Products reset');
    } catch (error) {
      setDatabaseStatus('Reset failed: ' + error.message);
      console.error('❌ Reset failed:', error);
    }
  };

  if (status === 'loading') {
    return (
      <Layout title="Database Status - Admin" description="Check database synchronization">
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
    <Layout title="Database Status - Admin" description="Check database synchronization">
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Synchronization Status</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Database Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Database Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    databaseStatus === 'Connected' ? 'bg-green-100 text-green-800' :
                    databaseStatus === 'Test successful!' ? 'bg-blue-100 text-blue-800' :
                    databaseStatus.includes('Error') ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {databaseStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Products in Database:</span>
                  <span className="font-semibold">{products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Last Updated:</span>
                  <span className="text-sm text-gray-600">{lastUpdate}</span>
                </div>
              </div>
            </div>

            {/* Test Controls */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              <div className="space-y-3">
                <button
                  onClick={handleTestDatabase}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Database Connection
                </button>
                <button
                  onClick={loadProducts}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Refresh Products
                </button>
                <button
                  onClick={handleClearProducts}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All Products
                </button>
                <button
                  onClick={handleResetProducts}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reset to Mock Data
                </button>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Products ({products.length})</h2>
            
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

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Test Database Connection" to add a test product</li>
              <li>• Check the admin products page to see if it appears</li>
              <li>• Check user pages to see if they sync</li>
              <li>• Open multiple tabs to test cross-tab synchronization</li>
              <li>• Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DatabaseStatus;





