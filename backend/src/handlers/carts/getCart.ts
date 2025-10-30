import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { successResponse, errorResponse, log, logError } from '../../utils/response';

/**
 * Get user's cart
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    log('Getting cart for user', { userId });

    const params = {
      TableName: TABLES.CARTS,
      Key: {
        userId: userId,
      },
    };

    const result = await dynamoDbDocClient.send(new GetCommand(params));

    if (!result.Item) {
      // Return empty cart if not found
      const emptyCart = {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
      return successResponse(emptyCart, 'Cart is empty');
    }

    log('Cart retrieved successfully', { userId });

    return successResponse(result.Item, 'Cart retrieved successfully');
  } catch (error: any) {
    logError('Error getting cart', error);
    return errorResponse('Failed to retrieve cart', 500, error.message);
  }
};
