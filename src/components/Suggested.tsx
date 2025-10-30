import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecommendationService } from '../services'
import { useAuth } from '../contexts/AuthContext'
import type { Product } from '../types/product'

const Suggested = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const userId = currentUser?.uid || 'test-user-123';
    setLoading(true);
    setError(null);

    RecommendationService.getUserRecommendations(userId, 4)
      .then((recs) => {
        if (!isMounted) return;
        setProducts(recs);
        setLoading(false);
      })
      .catch((e) => {
        if (!isMounted) return;
        console.error('Failed to load recommendations', e);
        setError('Failed to load recommendations');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  if (loading) {
    return (
      <section className="py-20 bg-white border-b border-black/20 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-gray-500 tracking-widest uppercase">Suggested For You</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">Suggested Snacks</h2>
            <div className="w-24 h-1 bg-black mx-auto"></div>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white border-b border-black/20 mt-20 ">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600">Error loading recommendations: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white border-b border-black/20 mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-gray-500 tracking-widest uppercase">Suggested For You</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">Suggested Snacks</h2>
          <div className="w-24 h-1 bg-black mx-auto"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">Discover personalized snack picks curated just for you — from crispy chips and decadent sweets to rich chocolates and crunchy nuts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <div
              key={product.products_id}
              className="cursor-pointer"
              onClick={() => navigate(`/product/${product.products_id}`)}
            >
              <div className="mb-4 overflow-hidden bg-gray-50">
                <img
                  src={product.imageUrl || "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                  alt={product.name}
                  className="w-full h-[300px] object-cover"
                />
              </div>
              {/* <div className="flex gap-1 mb-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.category}</span>
              </div> */}
              <h3 className="font-medium text-lg">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
              <p className="text-lg font-bold mt-1">₹{product.price.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button onClick={() => navigate('/collections/suggested')} className="inline-block border-2 border-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider">
            View All Collection
          </button>
        </div>
      </div>
    </section>
  )
}

export default Suggested