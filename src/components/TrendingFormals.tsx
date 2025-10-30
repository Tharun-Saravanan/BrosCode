
import { useNavigate } from 'react-router-dom'

const TrendingFormals = () => {
  const navigate = useNavigate();
  const products = [
    {
      id: 1,
      name: "Premium Mixed Nuts",
      price: "₹399.00",
      rating: 4.9,
      reviews: 25,
      image: "https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      varieties: ["Salted", "Honey Roasted"]
    },
    {
      id: 2,
      name: "Artisanal Chocolate Truffles",
      price: "₹595.00",
      rating: 4.8,
      reviews: 32,
      image: "https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      varieties: ["Dark", "Milk", "White"]
    },
    {
      id: 3,
      name: "Gourmet Potato Chips",
      price: "₹195.00",
      rating: 4.7,
      reviews: 28,
      image: "https://images.pexels.com/photos/568805/pexels-photo-568805.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      varieties: ["Classic", "Spicy", "Herbs"]
    },
    {
      id: 4,
      name: "Assorted Cookies Box",
      price: "₹495.00",
      rating: 4.8,
      reviews: 19,
      image: "https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      varieties: ["Chocolate", "Vanilla", "Oatmeal"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="text-center md:text-left md:max-w-xl mb-8 md:mb-0">
            <span className="text-sm font-medium text-gray-500 tracking-widest uppercase">Delicious Delights</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">TRENDING SNACKS</h2>
            <div className="w-24 h-1 bg-black mx-auto md:mx-0"></div>
            <p className="text-gray-600 mt-6">Discover our curated selection of premium snacks, from artisanal chocolates to gourmet nuts, perfect for every craving.</p>
            <button className="mt-6 inline-block border-2 border-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider">
              Explore Treats
            </button>
          </div>

          <div className="md:w-1/3">
            <img
              src="https://images.pexels.com/photos/1030970/pexels-photo-1030970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Premium Snacks Collection"
              className="w-full h-auto rounded-sm shadow-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <div
              key={product.id}
              className="cursor-pointer"
              onClick={() => navigate('/collections/shoes')}
            >
              <div className="mb-4 overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[300px] object-cover"
                />
              </div>
              <div className="flex gap-2 mb-2 flex-wrap">
                {product.varieties.map((variety, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                  >
                    {variety}
                  </span>
                ))}
              </div>
              <h3 className="font-medium text-lg">{product.name}</h3>
              <div className="flex items-center mt-2 mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                      stroke="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">{product.reviews} reviews</span>
              </div>
              <p className="text-lg font-bold">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrendingFormals;