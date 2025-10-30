import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';

const Sandals = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name_asc'>('relevance');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice ? parseFloat(minPrice) : -Infinity;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;

    let list = products.filter(p => {
      const inCategory = category === 'All' || p.category === category;
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q));
      const price = Number(p.price);
      const inPrice = !isNaN(price) && price >= min && price <= max;
      return inCategory && matchesQuery && inPrice;
    });

    switch (sortBy) {
      case 'price_asc':
        list = list.slice().sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        list = list.slice().sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name_asc':
        list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        break;
    }

    return list;
  }, [products, query, category, minPrice, maxPrice, sortBy]);

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
      <p className="text-gray-600 mb-8">Browse all snacks. Search, filter, and sort to find your favorites.</p>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search snacks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No snacks match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSorted.map(product => (
            <div
              key={product.products_id}
              className="cursor-pointer"
              onClick={() => navigate(`/product/${product.products_id}`)}
            >
              <div className="relative overflow-hidden mb-4">
                <img
                  src={product.imageUrl || "https://images.unsplash.com/photo-1585540651185-4e5f37c72142?auto=format&fit=crop&w=800&q=80"}
                  alt={product.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="absolute top-0 right-0 bg-black text-white text-xs px-3 py-1">{product.category}</div>
              </div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
              <p className="text-gray-700 font-semibold mt-2">₹{product.price.toLocaleString()}</p>
              <div className="mt-1">
                <p className="text-xs text-gray-500">Sizes: {product.sizes.slice(0, 3).join(', ')}{product.sizes.length > 3 ? '...' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sandals;