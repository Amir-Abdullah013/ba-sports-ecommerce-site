import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiStar, FiMinus, FiPlus, FiShoppingCart, FiShare, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import ShareModal from '../../components/ShareModal';
import { getProduct, getProducts } from '../../lib/api';

const ProductDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // ✅ Load product
  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const productData = await getProduct(id);
      if (productData) {
        setProduct(productData);
        loadRelatedProducts(productData.category);
      } else {
        router.push('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Load related products
  const loadRelatedProducts = async (category) => {
    try {
      const allProducts = await getProducts();
      const related = allProducts
        .filter((p) => p.category === category && p.id !== parseInt(id))
        .slice(0, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  // ✅ Quantity Change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  // ✅ Add to cart with localStorage
  const handleAddToCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = savedCart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      savedCart.push({ ...product, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(savedCart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);

    // notify navbar/cart
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // ✅ Share handler
  const handleShare = () => {
    setShowShareModal(true);

    setTimeout(() => {
      if (navigator.share && !showShareModal) {
        navigator
          .share({
            title: product?.name,
            text: `${product?.name} - Check out this amazing product!`,
            url: window.location.href,
          })
          .catch(() => {
            navigator.clipboard
              .writeText(window.location.href)
              .then(() => {
                alert('Product link copied to clipboard!');
              })
              .catch(() => {
                window.open(window.location.href, '_blank');
              });
          });
      }
    }, 100);
  };

  // ✅ Rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <FiStar className="w-5 h-5 text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <FiStar className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  // ✅ Loading skeleton
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 aspect-square rounded-2xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl animate-pulse" />
                <div className="h-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl w-3/4 animate-pulse" />
                <div className="h-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl w-1/2 animate-pulse" />
                <div className="h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ✅ Not found
  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
            <Link href="/products">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
                Back to Products
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // ✅ Handle product images
  const productImages = (() => {
    if (Array.isArray(product.images)) return product.images;
    if (typeof product.images === 'string' && product.images) {
      try {
        return JSON.parse(product.images);
      } catch {
        return [product.image];
      }
    }
    return [product.image];
  })();

  return (
    <Layout title={`${product.name} - BA Sports`} description={product.description}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-white/60 mb-8"
          >
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-blue-400 transition-colors">Products</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category}`} className="hover:text-blue-400 transition-colors">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white/60 hover:text-blue-400 transition-colors"
            >
              <FiArrowLeft />
              <span>Back</span>
            </button>
          </motion.div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="aspect-square bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src={productImages[selectedImage] || '/api/placeholder/600/600'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/600';
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div className="flex space-x-3">
                {productImages.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-blue-400 shadow-lg'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={image || '/api/placeholder/80/80'}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/80/80';
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Category & Featured */}
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-500/30">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium rounded-full">
                    Featured
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-white">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-white/60">({product.rating} out of 5)</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-white">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-white/50 line-through">${product.originalPrice}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-white/80 text-lg leading-relaxed">{product.description}</p>

              {/* Stock */}
              <div className="flex items-center space-x-2">
                {product.stock > 0 ? (
                  <>
                    <FiCheck className="text-green-400" />
                    <span className="text-green-400 font-medium">
                      In Stock ({product.stock} available)
                    </span>
                  </>
                ) : (
                  <span className="text-red-400 font-medium">Out of Stock</span>
                )}
              </div>

              {/* Quantity + Actions */}
              {product.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-white/80 font-medium">Quantity:</span>
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                      >
                        <FiMinus size={16} />
                      </motion.button>
                      <span className="w-12 text-center font-medium text-lg text-white">{quantity}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                      >
                        <FiPlus size={16} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                        addedToCart
                          ? 'bg-green-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <FiCheck />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <FiShoppingCart />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="p-4 border-2 border-white/20 bg-white/10 backdrop-blur-xl rounded-xl text-white hover:border-blue-400 hover:text-blue-400 transition-colors"
                    >
                      <FiShare size={24} />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-16"
            >
              <h2 className="text-3xl font-bold text-white mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    onAddToCart={(prod, qty) => {
                      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
                      const existingItem = savedCart.find((item) => item.id === prod.id);

                      if (existingItem) {
                        existingItem.quantity += qty || 1;
                      } else {
                        savedCart.push({ ...prod, quantity: qty || 1 });
                      }

                      localStorage.setItem('cart', JSON.stringify(savedCart));
                      window.dispatchEvent(new Event('cartUpdated'));
                    }}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} product={product} />
    </Layout>
  );
};

export default ProductDetailPage;
