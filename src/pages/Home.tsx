import { useEffect } from 'react';
import Hero from '../components/Hero';
import NewArrivalsSection from '../components/Suggested';
import BestSellersSection from '../components/BestSellers';
import TrendingSnacks from '../components/TrendingSnacks';

import Newsletter from '../components/Newsletter';

const Home = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Hero />
      <NewArrivalsSection />
      <BestSellersSection />
      <TrendingSnacks />
      <div className="flex flex-col md:flex-row justify-center gap-8 py-12 bg-gray-50 px-4">
        <div className="text-center md:w-1/4 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-2">FREE SHIPPING</h3>
          <p className="text-sm text-gray-600">Free delivery on snack orders above ₹1000</p>
        </div>
        <div className="text-center md:w-1/4 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-2">SUPPORT 24/7</h3>
          <p className="text-sm text-gray-600">Snack experts available 24/7 for orders and product help</p>
        </div>
        {/* <div className="text-center md:w-1/4 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-2">Fresh Snacks</h3>
          <p className="text-sm text-gray-600">Easy 3-day replacement for sealed snack pack</p>
        </div> */}
        <div className="text-center md:w-1/4 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-2">100% PAYMENT SECURE</h3>
          <p className="text-sm text-gray-600">Secure, encrypted payments for your snack shopping</p>
        </div>
      </div>
      <Newsletter />
    </>
  );
};

export default Home;
