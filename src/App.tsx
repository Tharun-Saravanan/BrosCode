import { useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

import { ProductService } from './services'
import { validateAWSConfig, checkAWSHealth } from './config/aws'
import Header from './components/Header'
import Footer from './components/Footer'
import CartInitializer from './components/CartInitializer'
import Cart from './components/Cart'
import Home from './pages/Home'
import SuggestedPage from './pages/SuggestedPage'
import BestSellersPage from './pages/BestSellers'

import AllProducts from './pages/AllProducts'

import SignInPage from './pages/SignIn'
import SignUpPage from './pages/SignUp'
import ProfilePage from './pages/Profile'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import PurchaseHistory from './pages/PurchaseHistory'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing E-commerce Application...');

        // Validate AWS configuration
        const configValid = validateAWSConfig();
        if (configValid) {
          // Check AWS services health
          const health = await checkAWSHealth();
          console.log('🏥 AWS Health Check:', health);
        }

        // Initialize ProductService with real-time sync
        ProductService.initialize();

        console.log('✅ E-commerce Application initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize E-commerce Application:', error);
        console.warn('⚠️ Falling back to localStorage mode');
      }
    };

    initializeApp();
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          <CartInitializer />
          <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections/suggested" element={<SuggestedPage />} />
          <Route path="/collections/best-sellers" element={<BestSellersPage />} />

          <Route path="/collections/allproducts" element={<AllProducts />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/order-success" element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          } />
          <Route path="/purchase-history" element={
            <ProtectedRoute>
              <PurchaseHistory />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
          <Footer />
        </div>
        <Cart />
        </Router>
        </CartProvider>
      </AuthProvider>
    </Provider>
  )
}

export default App