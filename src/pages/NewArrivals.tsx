import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useFeaturedProducts } from '../hooks/useProducts';

const NewArrivals = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useFeaturedProducts(12);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading suggested snacks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading suggestions: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 mt-20">
      <h1 className="text-3xl font-bold mb-2">Suggested Snacks for You</h1>
      <p className="text-gray-600 mb-8">Personalized snack picks curated for you</p>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No suggestions available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div
              key={product.products_id}
              className="cursor-pointer"
              onClick={() => navigate(`/product/${product.products_id}`)}
            >
              <div className="relative overflow-hidden mb-4">
                <img
                  src={product.imageUrl || "https://images.unsplash.com/photo-1614252235316-8c857f6e6f87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                  alt={product.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="absolute top-0 right-0 bg-black text-white text-xs px-3 py-1">NEW</div>
              </div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
              <p className="text-gray-700 font-semibold mt-2">₹{product.price.toLocaleString()}</p>
              <div className="mt-1">
                <p className="text-xs text-gray-500">Category: {product.category}</p>
                <p className="text-xs text-gray-500">Sizes: {product.sizes.slice(0, 3).join(', ')}{product.sizes.length > 3 ? '...' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewArrivals;