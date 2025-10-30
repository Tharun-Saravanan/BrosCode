import { useEffect } from 'react';
import Hero from '../components/Hero';
import NewArrivalsSection from '../components/NewArrivals';
import BestSellersSection from '../components/BestSellers';
import TrendingFormals from '../components/TrendingFormals';

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
      <TrendingFormals />
      <div className="flex flex-col md:flex-row justify-center gap-8 py-12 bg-gray-50 px-4">
        <div className="text-center md:w-1/4 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-2">FREE SHIPPING</h3>
          <p className="text-sm text-gray-600">Free shipping on all orders above ₹1000</p>
        </div>
        <div className="text-center md:w-1/4 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-2">SUPPORT 24/7</h3>
          <p className="text-sm text-gray-600">Contact us 24 hours a day, 7 days a week</p>
        </div>
        <div className="text-center md:w-1/4 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-2">3 DAYS RETURN</h3>
          <p className="text-sm text-gray-600">Simply return it within 3 days for an exchange</p>
        </div>
        <div className="text-center md:w-1/4 flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-2">100% PAYMENT SECURE</h3>
          <p className="text-sm text-gray-600">We ensure secure payment with SSL Encryption</p>
        </div>
      </div>
      <Newsletter />
    </>
  );
};

export default Home;
