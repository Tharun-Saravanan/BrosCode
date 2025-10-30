import { useState, useEffect, useCallback } from 'react'

const Hero = () => {
  const slides = [
    {
      image: "https://images.pexels.com/photos/1407346/pexels-photo-1407346.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Delicious Donuts",
      description: "Indulge in our freshly baked, artisanal donuts with a variety of mouthwatering toppings."
    },
    {
      image: "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Gourmet Potato Chips",
      description: "Discover our exclusive collection of hand-cooked potato chips in unique, bold flavors."
    },
    {
      image: "https://images.pexels.com/photos/1028708/pexels-photo-1028708.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Premium Chocolates",
      description: "Experience the finest selection of handcrafted chocolates made with premium ingredients."
    },
    {
      image: "https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Mixed Nuts & Treats",
      description: "Savor our carefully curated selection of roasted nuts, dried fruits, and sweet treats."
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
      <div className="relative w-full overflow-hidden px-4 md:px-8 py-8 mt-20">
        {/* Heading */}
        <div className="w-full mx-auto mb-6 px-2 flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">Featured Snacks</h1>
          <p className="text-gray-600 mt-3 text-lg md:text-xl">Handpicked treats and trending flavors curated just for you.</p>
        </div>
  <div className="relative w-full h-[500px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl mx-auto ">
      {/* Image Container */}
      {slides.map((slide, index) => (
        <div
          key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 rounded-2xl overflow-hidden ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10"></div>

          {/* Background Image */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <img
              src={slide.image}
              alt={slide.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-3000"
              style={{
                objectPosition: "center 30%"
              }}
            />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-end justify-center pb-16 z-20">
              <div className="container mx-auto px-8 md:px-12 text-center">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-3">{slide.title}</h2>
                <p className="text-white text-xl md:text-2xl mb-8">{slide.description}</p>
                  <button className="bg-white text-black hover:bg-black hover:text-white transition-all duration-300 px-8 py-3 font-medium rounded-lg shadow-lg hover:shadow-xl">
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
        <div className="absolute inset-x-0 bottom-8 flex justify-center items-center space-x-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 shadow-md ${
                currentSlide === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 z-30 transition-all duration-300 shadow-lg hover:shadow-xl"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 z-30 transition-all duration-300 shadow-lg hover:shadow-xl"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
        </div>
    </div>
  );
};

export default Hero;