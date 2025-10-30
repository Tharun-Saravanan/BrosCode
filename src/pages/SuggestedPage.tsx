import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecommendationService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/product';

const SuggestedPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top and fetch recommendations on mount/user change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const userId = currentUser?.uid || 'test-user-123';
    setLoading(true);
    setError(null);

    const limit = 6;
    RecommendationService.getUserRecommendations(userId, limit)
      .then((recs) => {
        if (!isMounted) return;
        const clean = (recs || []).filter(p => !!p && !!p.products_id);
        setProducts(clean.slice(0, limit));
        setLoading(false);
      })
      .catch((e) => {
        if (!isMounted) return;
        console.error('Failed to load recommendations (SuggestedPage)', e);
        setError('Failed to load recommendations');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading recommendations...</p>

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
            <p className="text-red-600">Error loading recommendations: {error}</p>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 mt-20">
      <h1 className="text-3xl font-bold mb-2">Recommended For You</h1>
      <p className="text-gray-600 mb-8">Handpicked items based on your activity</p>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No recommendations yet.</p>

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
                {/* Recommendation badge optional */}

              </div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
              <p className="text-gray-700 font-semibold mt-2">₹{product.price.toLocaleString()}</p>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestedPage;