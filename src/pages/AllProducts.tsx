import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';

const AllProducts = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice ? parseFloat(minPrice) : Number.NEGATIVE_INFINITY;
    const max = maxPrice ? parseFloat(maxPrice) : Number.POSITIVE_INFINITY;

    let list = products.filter(p => {
      const matchesQuery = q
        ? p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        : true;
      const price = typeof p.price === 'number' ? p.price : Number(p.price);
      const matchesPrice = price >= min && price <= max;
      return matchesQuery && matchesPrice;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [products, query, minPrice, maxPrice, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading snacks...</p>
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
            <p className="text-red-600">Error loading snacks: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 mt-20">
      <h1 className="text-3xl font-bold mb-2">All Snacks</h1>
      <p className="text-gray-600 mb-8">Find your favorite snacks. Search, filter and sort for the perfect bite.</p>

      <div className="bg-white border rounded-lg p-4 mb-8">
        <div className="flex items-center gap-3 flex-nowrap overflow-x-auto whitespace-nowrap">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search snacks by name or description"
            className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-44 border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-28 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-28 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="ml-auto flex items-center gap-3 text-sm text-gray-600">
            <span>{filtered.length} items</span>
            <button
              onClick={() => { setQuery(''); setMinPrice(''); setMaxPrice(''); setSortBy('relevance'); }}
              className="underline"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No snacks available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(product => (
            <div
              key={product.products_id}
              className="cursor-pointer"
              onClick={() => navigate(`/product/${product.products_id}`)}
            >
              <div className="relative overflow-hidden mb-4">
                <img
                  src={product.imageUrl || "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800"}
                  alt={product.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
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

export default AllProducts;