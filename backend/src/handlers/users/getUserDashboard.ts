import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { successResponse, errorResponse, log, logError } from '../../utils/response';
import { Cart, LikedProductsList, Product } from '../../types';

interface UserDashboard {
  userId: string;
  cart: Cart;
  likedProducts: LikedProductsList;
  allProducts: Product[];
}

/**
 * Get comprehensive user dashboard data including cart, liked products, and all products
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    log('Getting dashboard data for user', { userId });

    // Fetch all data in parallel for better performance
    const [cartResult, likedResult, productsResult] = await Promise.all([
      // Get user's cart
      dynamoDbDocClient.send(new GetCommand({
        TableName: TABLES.CARTS,
        Key: { userId },
      })),
      // Get user's liked products
      dynamoDbDocClient.send(new GetCommand({
        TableName: TABLES.LIKED,
        Key: { userId },
      })),
      // Get all products
      dynamoDbDocClient.send(new ScanCommand({
        TableName: TABLES.PRODUCTS,
      })),
    ]);

    // Prepare cart data
    const cart: Cart = cartResult.Item as Cart || {
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Prepare liked products data
    const likedProducts: LikedProductsList = likedResult.Item as LikedProductsList || {
      userId,
      products: [],
      totalLiked: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Prepare products data
    const allProducts: Product[] = (productsResult.Items as Product[]) || [];

    // Construct dashboard response
    const dashboard: UserDashboard = {
      userId,
      cart,
      likedProducts,
      allProducts,
    };

    log('Dashboard data retrieved successfully', { 
      userId, 
      cartItems: cart.totalItems,
      likedCount: likedProducts.totalLiked,
      productsCount: allProducts.length,
    });

    return successResponse(dashboard, 'User dashboard retrieved successfully');
  } catch (error: any) {
    logError('Error getting user dashboard', error);
    return errorResponse('Failed to retrieve user dashboard', 500, error.message);
  }
};
