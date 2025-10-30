import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppSelector } from '../store/hooks';
import { ApiPurchaseService, type PaymentDetails, type ShippingAddress } from '../services/apiPurchaseService';
import type { CartItem } from '../types/cart';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const cart = useAppSelector((state) => state.cart);

  const [step, setStep] = useState<'shipping' | 'payment' | 'processing'>('shipping');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phoneNumber: '',
  });

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'cod'>('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    bankName: '',
  });

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || 
        !shippingAddress.city || !shippingAddress.state || 
        !shippingAddress.pincode || !shippingAddress.phoneNumber) {
      setError('Please fill in all required shipping fields');
      return;
    }

    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError('Please sign in to complete your purchase');
      navigate('/signin');
      return;
    }

    // Validate payment details
    if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardHolderName || 
          !paymentDetails.expiryDate || !paymentDetails.cvv) {
        setError('Please fill in all card details');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId) {
        setError('Please enter your UPI ID');
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!paymentDetails.bankName) {
        setError('Please select your bank');
        return;
      }
    }

    setLoading(true);
    setStep('processing');

    try {
      const payment: PaymentDetails = {
        method: paymentMethod,
        ...(paymentMethod === 'card' && {
          cardNumber: paymentDetails.cardNumber,
          cardHolderName: paymentDetails.cardHolderName,
          expiryDate: paymentDetails.expiryDate,
        }),
        ...(paymentMethod === 'upi' && { upiId: paymentDetails.upiId }),
        ...(paymentMethod === 'netbanking' && { bankName: paymentDetails.bankName }),
      };

      const purchaseData = {
        items: cart.items,
        totalAmount: cart.totalPrice,
        paymentDetails: payment,
        shippingAddress,
      };

      const result = await ApiPurchaseService.createPurchase(currentUser.uid, purchaseData);
      
      // Navigate to success page
      navigate('/order-success', { state: { purchase: result.purchase } });
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === 'shipping' ? 'text-black' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-black text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'payment' || step === 'processing' ? 'text-black' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' || step === 'processing' ? 'bg-black text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Shipping Form */}
            {step === 'shipping' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State *</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pincode *</label>
                      <input
                        type="text"
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={shippingAddress.phoneNumber}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phoneNumber: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 px-6 font-medium hover:bg-gray-800"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {/* Payment Form */}
            {step === 'payment' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(['card', 'upi', 'netbanking', 'cod'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                          paymentMethod === method
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {method === 'card' && '💳 Card'}
                        {method === 'upi' && '📱 UPI'}
                        {method === 'netbanking' && '🏦 Net Banking'}
                        {method === 'cod' && '💵 COD'}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {/* Card Payment */}
                  {paymentMethod === 'card' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Card Number *</label>
                        <input
                          type="text"
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                          placeholder="1234 5678 9012 3456"
                          maxLength={16}
                          className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          value={paymentDetails.cardHolderName}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolderName: e.target.value })}
                          className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                          <input
                            type="text"
                            value={paymentDetails.expiryDate}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">CVV *</label>
                          <input
                            type="text"
                            value={paymentDetails.cvv}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                            placeholder="123"
                            maxLength={3}
                            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* UPI Payment */}
                  {paymentMethod === 'upi' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">UPI ID *</label>
                      <input
                        type="text"
                        value={paymentDetails.upiId}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                        placeholder="yourname@upi"
                        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                        required
                      />
                    </div>
                  )}

                  {/* Net Banking */}
                  {paymentMethod === 'netbanking' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Bank *</label>
                      <select
                        value={paymentDetails.bankName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
                        required
                      >
                        <option value="">Choose your bank</option>
                        <option value="SBI">State Bank of India</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="AXIS">Axis Bank</option>
                        <option value="KOTAK">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  {/* COD */}
                  {paymentMethod === 'cod' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                      <p className="text-sm text-yellow-800">
                        💵 Pay cash on delivery. Please keep exact change ready.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="flex-1 border-2 border-black text-black py-3 px-6 font-medium hover:bg-gray-100"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-black text-white py-3 px-6 font-medium hover:bg-gray-800 disabled:bg-gray-400"
                    >
                      {loading ? 'Processing...' : `Pay ₹${cart.totalPrice.toLocaleString()}`}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Processing */}
            {step === 'processing' && (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Processing Payment...</h3>
                <p className="text-gray-600">Please wait while we process your payment</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-24">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{cart.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{cart.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
