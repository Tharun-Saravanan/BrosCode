import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const purchase = location.state?.purchase;

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-20">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{purchase.purchaseId}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-medium">{purchase.transactionId}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Order Status:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {purchase.orderStatus}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Delivery Status:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {purchase.deliveryStatus}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium">
                {new Date(purchase.estimatedDelivery).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between py-2 pt-4">
              <span className="text-gray-900 font-bold text-lg">Total Amount:</span>
              <span className="text-black font-bold text-lg">₹{purchase.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-3">📦 What's Next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>You will receive an order confirmation email shortly</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Track your order status in the Purchase History section</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>We'll notify you when your order ships</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/purchase-history')}
            className="flex-1 bg-black text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors"
          >
            View Purchase History
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 border-2 border-black text-black py-3 px-6 font-medium hover:bg-gray-100 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
