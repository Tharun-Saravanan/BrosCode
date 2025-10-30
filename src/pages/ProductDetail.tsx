import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useAppSelector } from '../store/hooks';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const { currentUser } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const { loading: cartLoading } = useAppSelector((state) => state.cart);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const product = products.find(p => (p.products_id === id || p.id === id));

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);



  // Get product images (use new images array or fallback to single imageUrl)
  const productImages = product?.images && product.images.length > 0
    ? product.images
    : product?.imageUrl
    ? [product.imageUrl]
    : ["https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovering) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovering(true);
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Add a small delay before hiding zoom to prevent flickering
    timeoutRef.current = setTimeout(() => {
      setIsZoomed(false);
    }, 100);
  };

  

  const handleAddToCart = async () => {
    if (!product) return;

    // If user is not signed in, redirect to login page
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    // Add to cart for authenticated user
    await addToCartWithAuth();
  };



  const addToCartWithAuth = async () => {
    if (!product) return;

    try {
      const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : product.imageUrl || "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

      await addToCartContext({
        productId: product.products_id,
        name: product.name,
        price: product.price,
        imageUrl,
        quantity: 1,
        category: product.category
      });

      // Show success message
      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 3000);

    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Product</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          {/* Main Image - Reduced size to fit viewport better */}
          <div
            className={`w-full h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden relative ${isHovering ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            <img
              src={productImages[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {isZoomed && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Hover to zoom
              </div>
            )}
          </div>

          {/* Enhanced Thumbnail Gallery - Always visible and larger */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Product Images ({productImages.length})</h4>
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                    selectedImageIndex === index
                      ? 'border-black shadow-lg'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            {productImages.length > 4 && (
              <p className="text-xs text-gray-500 text-center">
                Scroll to see more images
              </p>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500">
            <button onClick={() => navigate('/')} className="hover:text-black">
              Home
            </button>
            <span className="mx-2">/</span>
            <span className="text-black">{product.name}</span>
          </nav>

          {/* Product Info */}
          <div>
            <div className="mb-2">
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                {product.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-xl font-bold text-gray-900 mb-6">₹{product.price.toLocaleString()}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Sizes */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-3">
              Available Sizes {selectedSize && <span className="text-sm font-normal text-gray-600">(Selected: {selectedSize})</span>}
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black hover:bg-black hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="text-sm text-gray-500 mt-2">Please select a size</p>
            )}
          </div> */}

          {/* Add to Cart */}
          <div className="space-y-4">
            {addToCartSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm animate-in fade-in slide-in-from-top-2">
                ✓ Item added to cart successfully!
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className={`w-full py-4 px-6 font-medium transition-colors ${
                cartLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {cartLoading ? 'ADDING...' : 'ADD TO CART'}
            </button>

            <button
              className="w-full border-2 border-black text-black py-4 px-6 font-medium hover:bg-black hover:text-white transition-colors"
            >
              BUY IT NOW
            </button>
          </div>

          {/* Product Features */}
          <div className="border-t pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="font-medium">✓</span>
                <span className="ml-2">Free shipping on orders above ₹1000</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">✓</span>
                <span className="ml-2">3 days return policy</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">✓</span>
                <span className="ml-2">100% secure payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Box Overlay - Positioned next to the main image */}
      {isZoomed && (
        <div className="hidden lg:block absolute top-8 left-1/2 ml-8 w-72 h-72 xl:w-80 xl:h-80 bg-white rounded-xl overflow-hidden border-2 border-gray-200 shadow-2xl z-50 transition-all duration-300 animate-in fade-in slide-in-from-left-4">
          <div
            className="w-full h-full bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${productImages[selectedImageIndex]})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '300%'
            }}
          />
          <div className="absolute top-2 left-3 bg-black bg-opacity-80 text-white px-2 py-1 rounded-full text-xs font-medium">
            🔍 Zoomed View
          </div>
        </div>
      )}


    </div>
  );
};

export default ProductDetail;
