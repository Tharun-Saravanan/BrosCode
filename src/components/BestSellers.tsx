
import { useNavigate } from 'react-router-dom'
import { useFeaturedProducts } from '../hooks/useProducts'

const BestSellers = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useFeaturedProducts(4);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-gray-500 tracking-widest uppercase">Customer Favorites</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">BEST SELLERS</h2>
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600">Error loading products: {error}</p>
          </div>
        </div>
      </section>
    );
  }



  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-gray-500 tracking-widest uppercase">Customer Favorites</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">BEST SELLERS</h2>
          <div className="w-24 h-1 bg-black mx-auto"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">Our most loved collection of handcrafted leather shoes, perfectly blending timeless elegance with modern comfort.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <div
              key={product.products_id}
              className="bg-white rounded-sm shadow-sm overflow-hidden cursor-pointer"
              onClick={() => navigate(`/product/${product.products_id}`)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.imageUrl || "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                  alt={product.name}
                  className="w-full h-[300px] object-cover"
                />
                <div className="absolute top-4 left-4 bg-black text-white text-xs py-1 px-2 font-medium">
                  {product.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-lg font-bold">₹{product.price.toLocaleString()}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Available sizes: {product.sizes.join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="inline-block border-2 border-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider">
            Shop All Best Sellers
          </button>
        </div>
      </div>
    </section>
  )
}

export default BestSellers