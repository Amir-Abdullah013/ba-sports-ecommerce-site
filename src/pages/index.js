import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiShoppingCart, FiArrowRight, FiPackage } from "react-icons/fi";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import Toast from "../components/Toast";
import { getProducts } from "../lib/api";
import { useSession } from "next-auth/react";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { data: session } = useSession();

  const fetchProducts = async () => {
    try {
      const products = await getProducts();
      setFeaturedProducts(products.slice(0, 4));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // CART FUNCTIONALITY: Add to cart handler
  const handleAddToCart = useCallback((product) => {
    try {
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItemIndex = currentCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += 1;
        setToastMessage(`Updated ${product.name} quantity in cart`);
      } else {
        currentCart.push({
          ...product,
          quantity: 1,
          addedAt: new Date().toISOString(),
        });
        setToastMessage(`${product.name} added to cart!`);
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cartUpdated"));

      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setToastMessage("Failed to add item to cart");
      setToastType("error");
      setShowToast(true);
    }
  }, []);

  const features = [
    {
      title: "Premium Quality",
      description:
        "Only the finest sports equipment from trusted brands worldwide",
      icon: "🏆",
    },
    {
      title: "Fast Shipping",
      description:
        "Quick and reliable delivery to get you back in the game faster",
      icon: "🚚",
    },
    {
      title: "Expert Support",
      description:
        "Professional guidance from sports enthusiasts who understand your needs",
      icon: "🎯",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "500+", label: "Premium Products" },
    { number: "50+", label: "Sports Categories" },
    { number: "24/7", label: "Customer Support" },
  ];

  return (
    <Layout
      title="BA Sports - Premium Sports Equipment"
      description="Your premier destination for high-quality sports equipment and gear."
    >
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Optimized Global Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl opacity-30 animate-float-gentle gpu-layer" />
          <div
            className="absolute top-20 -right-32 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl opacity-35 animate-float-slow gpu-layer"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-emerald-400/15 to-teal-500/15 rounded-full blur-3xl opacity-25 animate-fade-pulse gpu-layer"
            style={{ animationDelay: "4s" }}
          />
          <div className="absolute top-1/2 -left-20 w-64 h-64 bg-gradient-to-br from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl opacity-20 gpu-layer" />
          <div className="absolute bottom-1/3 -right-24 w-56 h-56 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl opacity-25 gpu-layer" />
        </div>

        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-20 left-20 w-4 h-4 bg-yellow-400/60 rotate-45 gpu-layer" />
            <div className="absolute top-40 right-32 w-3 h-3 bg-pink-400/60 rounded-full gpu-layer" />
            <div className="absolute bottom-32 left-1/3 w-5 h-5 bg-cyan-400/60 rotate-12 gpu-layer" />
            <div className="absolute bottom-20 right-20 w-3 h-3 bg-emerald-400/60 rounded-full gpu-layer" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  YOUR SPORT
                </span>
                <br />
                <span className="text-white">YOUR RULES</span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
                style={{
                  textShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                }}
              >
                Discover premium sports equipment that elevates your performance
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                <Link href="/products">
                  <button className="px-10 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3 hover:scale-105">
                    <FiShoppingCart className="w-5 h-5" />
                    <span>Shop Products</span>
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                </Link>

                <Link href="/about">
                  <button className="px-8 py-4 border-2 border-white/50 text-white rounded-xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center space-x-2 hover:scale-105">
                    <span>Learn More</span>
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Why Choose BA Sports?
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                We're committed to providing the best sports equipment and
                unmatched customer service
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 gpu-layer"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/80">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Discover our handpicked selection of premium sports equipment
              </p>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 animate-pulse gpu-layer"
                  >
                    <div className="aspect-square bg-white/20 rounded-xl mb-4" />
                    <div className="h-4 bg-white/20 rounded-lg mb-2" />
                    <div className="h-4 bg-white/20 rounded-lg w-3/4 mb-2" />
                    <div className="h-6 bg-white/20 rounded-lg w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="gpu-layer"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mt-12"
            >
              <Link href="/products">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 gpu-layer">
                  View All Products
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Order History Section - Only for authenticated users */}
        {session?.user && (
          <section className="relative py-20 overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-white mb-4">
                  Track Your Orders
                </h2>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  View your order history and track the status of your purchases
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl mx-auto">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Your Order History
                  </h3>
                  <p className="text-white/80 mb-6">
                    Keep track of all your purchases, view order status, and
                    manage your sports equipment orders in one place.
                  </p>
                  <Link href="/order-history">
                    <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-3 mx-auto">
                      <FiPackage className="w-5 h-5" />
                      <span>View My Orders</span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="gpu-layer"
                >
                  <h3 className="text-3xl md:text-4xl font-bold text-white">
                    {stat.number}
                  </h3>
                  <p className="text-white/70">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Toast Notifications */}
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </Layout>
  );
};

export default HomePage;
