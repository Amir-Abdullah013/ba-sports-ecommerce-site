import { useState } from 'react';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onAddToCart }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <FiStar className="w-4 h-4 text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="flex flex-col h-full">
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {!imageError && product.image && (
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setIsImageLoading(false);
                }}
              />
            )}

            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="text-gray-400 text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm">Image not available</div>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                {typeof product.category === 'object' ? product.category.name : product.category}
              </span>
            </div>

            {product.featured && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full">
                  Featured
                </span>
              </div>
            )}

            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                  Only {product.stock} left
                </span>
              </div>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3 flex-grow flex flex-col">
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-[3rem]">
                {product.name}
              </h3>
              {product.sku && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  SKU: {product.sku}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1 line-clamp-2 min-h-[2.5rem]">
                {product.description}
              </p>
            </div>

            <div className="flex items-center space-x-2 py-1">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-gray-500">
                ({product.rating})
              </span>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              
              {product.stock > 0 && onAddToCart && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Add to Cart
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;





