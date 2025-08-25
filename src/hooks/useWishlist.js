import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useWishlist = () => {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch user's wishlist  
  const fetchWishlist = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/wishlist');
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      const data = await response.json();
      setWishlist(data.wishlist || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    if (!session) {
      setError('Please sign in to add items to wishlist');
      setToast({ show: true, message: 'Please sign in to add items to wishlist', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
      return false;
    }

    if (!session.user || !session.user.id) {
      console.error('Session missing user ID:', session);
      setError('Authentication error. Please sign in again.');
      setToast({ show: true, message: 'Authentication error. Please sign in again.', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
      return false;
    }

    console.log('Adding to wishlist - Session:', session);
    console.log('Adding to wishlist - Product ID:', productId);

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      console.log('Wishlist API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Wishlist API Error:', errorData);
        throw new Error(errorData.error || 'Failed to add to wishlist');
      }

      const data = await response.json();
      console.log('Wishlist API Success:', data);
      
      // Update local state
      setWishlist(prev => [data.wishlistItem, ...prev]);
      
      // Show success toast
      setToast({ show: true, message: 'Added to wishlist!', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
      
      return true;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err.message);
      
      // Show error toast
      setToast({ show: true, message: err.message, type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!session) {
      setError('Please sign in to manage wishlist');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from wishlist');
      }

      // Update local state
      setWishlist(prev => prev.filter(item => item.productId !== productId));
      
      // Show success toast
      setToast({ show: true, message: 'Removed from wishlist!', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
      
      return true;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err.message);
      
      // Show error toast
      setToast({ show: true, message: err.message, type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle wishlist item (add if not present, remove if present)
  const toggleWishlist = async (productId) => {
    const isInWishlist = wishlist.some(item => item.productId === productId);
    
    if (isInWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.productId === productId);
  };

  // Get wishlist count
  const wishlistCount = wishlist.length;

  // Fetch wishlist on session change
  useEffect(() => {
    if (session) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [session]);

  return {
    wishlist,
    loading,
    error,
    toast,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    wishlistCount,
    fetchWishlist,
  };
};
