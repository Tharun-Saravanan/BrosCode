import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { successResponse, errorResponse } from '../../utils/response';

const client = new DynamoDBClient({ region: process.env.REGION || 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(client);

const PURCHASES_TABLE = process.env.PURCHASES_TABLE || 'sibilingshoe-purchases';
const CARTS_TABLE = process.env.CARTS_TABLE || 'sibilingshoe-carts';

interface PurchaseItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  category: string;
}

interface PaymentDetails {
  method: string; // 'card', 'upi', 'netbanking', 'cod'
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  upiId?: string;
  bankName?: string;
  transactionId?: string;
}

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
}

interface PurchaseRequest {
  userId: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentDetails: PaymentDetails;
  shippingAddress: ShippingAddress;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;
    
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const purchaseData: PurchaseRequest = JSON.parse(event.body);

    // Validate required fields
    if (!purchaseData.items || purchaseData.items.length === 0) {
      return errorResponse('Cart items are required', 400);
    }

    if (!purchaseData.paymentDetails) {
      return errorResponse('Payment details are required', 400);
    }

    if (!purchaseData.shippingAddress) {
      return errorResponse('Shipping address is required', 400);
    }

    // Generate purchase ID and transaction ID
    const purchaseId = `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Simulate payment processing (dummy payment gateway)
    const paymentStatus = simulatePayment(purchaseData.paymentDetails);

    if (paymentStatus !== 'SUCCESS') {
      return errorResponse('Payment failed. Please try again.', 400);
    }

    // Calculate totals
    const totalItems = purchaseData.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = purchaseData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create purchase record
    const purchase = {
      purchaseId,
      userId,
      items: purchaseData.items,
      totalItems,
      totalAmount,
      paymentDetails: {
        method: purchaseData.paymentDetails.method,
        transactionId,
        status: paymentStatus,
        // Mask sensitive information
        cardNumber: purchaseData.paymentDetails.cardNumber 
          ? `****${purchaseData.paymentDetails.cardNumber.slice(-4)}` 
          : undefined,
        upiId: purchaseData.paymentDetails.upiId,
        bankName: purchaseData.paymentDetails.bankName,
      },
      shippingAddress: purchaseData.shippingAddress,
      orderStatus: 'CONFIRMED',
      deliveryStatus: 'PROCESSING',
      estimatedDelivery: getEstimatedDeliveryDate(),
      purchaseDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save purchase to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: PURCHASES_TABLE,
        Item: purchase,
      })
    );

    // Clear user's cart after successful purchase
    try {
      await docClient.send(
        new PutCommand({
          TableName: CARTS_TABLE,
          Item: {
            userId,
            items: [],
            totalItems: 0,
            totalPrice: 0,
            updatedAt: new Date().toISOString(),
          },
        })
      );
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Don't fail the purchase if cart clear fails
    }

    return successResponse({
      purchase: {
        purchaseId,
        transactionId,
        totalAmount,
        orderStatus: purchase.orderStatus,
        deliveryStatus: purchase.deliveryStatus,
        estimatedDelivery: purchase.estimatedDelivery,
      },
    }, 'Purchase completed successfully');
  } catch (error) {
    console.error('Error creating purchase:', error);
    return errorResponse('Failed to process purchase', 500);
  }
};

// Dummy payment simulation
function simulatePayment(paymentDetails: PaymentDetails): 'SUCCESS' | 'FAILED' {
  // Simulate 95% success rate
  const random = Math.random();
  
  // Basic validation
  if (paymentDetails.method === 'card') {
    if (!paymentDetails.cardNumber || !paymentDetails.cardHolderName || !paymentDetails.expiryDate) {
      return 'FAILED';
    }
    // Simulate card validation (reject if card number contains '0000')
    if (paymentDetails.cardNumber.includes('0000')) {
      return 'FAILED';
    }
  } else if (paymentDetails.method === 'upi') {
    if (!paymentDetails.upiId) {
      return 'FAILED';
    }
  } else if (paymentDetails.method === 'netbanking') {
    if (!paymentDetails.bankName) {
      return 'FAILED';
    }
  }

  // 95% success rate
  return random > 0.05 ? 'SUCCESS' : 'FAILED';
}

function getEstimatedDeliveryDate(): string {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
  return deliveryDate.toISOString();
}
