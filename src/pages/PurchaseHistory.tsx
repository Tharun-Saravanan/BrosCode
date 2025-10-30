import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiPurchaseService, type Purchase } from '../services/apiPurchaseService';

const PurchaseHistory: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!currentUser) {
        navigate('/signin');
        return;
      }

      try {
        setLoading(true);
        const history = await ApiPurchaseService.getPurchaseHistory(currentUser.uid);
        setPurchases(history);
      } catch (err: any) {
        setError(err.message || 'Failed to load purchase history');
        console.error('Error fetching purchase history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Purchase History</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
          <p className="text-gray-600">View all your past orders and track deliveries</p>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start shopping and your orders will appear here</p>
            <button
              onClick={() => navigate('/')}
              className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <div key={purchase.purchaseId} className="bg-white rounded-lg shadow p-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Order #{purchase.purchaseId.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                      purchase.orderStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      purchase.orderStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      purchase.orderStatus === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                      purchase.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {purchase.orderStatus}
                    </span>
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                      purchase.deliveryStatus === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      purchase.deliveryStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      purchase.deliveryStatus === 'OUT_FOR_DELIVERY' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {purchase.deliveryStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {purchase.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Category: {item.category}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">₹{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm space-y-1">
                      <p className="text-gray-600">
                        <span className="font-medium">Payment Method:</span> {purchase.paymentDetails.method.toUpperCase()}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Transaction ID:</span> {purchase.paymentDetails.transactionId}
                      </p>
                      {purchase.deliveryStatus !== 'DELIVERED' && (
                        <p className="text-gray-600">
                          <span className="font-medium">Estimated Delivery:</span>{' '}
                          {new Date(purchase.estimatedDelivery).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">
                        Total Items: {purchase.totalItems}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{purchase.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-900 mb-1">Shipping Address:</p>
                    <p className="text-sm text-gray-600">
                      {purchase.shippingAddress.fullName}<br />
                      {purchase.shippingAddress.addressLine1}<br />
                      {purchase.shippingAddress.addressLine2 && <>{purchase.shippingAddress.addressLine2}<br /></>}
                      {purchase.shippingAddress.city}, {purchase.shippingAddress.state} - {purchase.shippingAddress.pincode}<br />
                      Phone: {purchase.shippingAddress.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
