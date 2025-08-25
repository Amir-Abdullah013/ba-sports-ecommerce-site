import { useEffect } from 'react';

export const useProductsSync = (loadProducts) => {
  useEffect(() => {
    console.log('🔧 Setting up product synchronization...');
    
    const handleProductsUpdate = () => {
      console.log('🔄 Products updated event received, refreshing products...');
      try {
        loadProducts();
        console.log('✅ Products refreshed successfully');
      } catch (error) {
        console.error('❌ Error refreshing products:', error);
      }
    };

    // Listen for product updates from other tabs/windows
    window.addEventListener('productsUpdated', handleProductsUpdate);
    console.log('📡 Added productsUpdated event listener');

    // Also listen for storage events (for cross-tab synchronization)
    const handleStorageChange = (e) => {
      if (e.key === 'ba_sports_products') {
        console.log('🔄 localStorage products changed, refreshing products...');
        try {
          loadProducts();
          console.log('✅ Products refreshed from storage event');
        } catch (error) {
          console.error('❌ Error refreshing products from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    console.log('📡 Added storage event listener');

    console.log('✅ Product synchronization listeners activated');

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate);
      window.removeEventListener('storage', handleStorageChange);
      console.log('📡 Product synchronization listeners deactivated');
    };
  }, [loadProducts]);
};
