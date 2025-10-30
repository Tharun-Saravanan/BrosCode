import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { successResponse, errorResponse, log, logError } from '../../utils/response';

/**
 * Clear user's cart
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    log('Clearing cart for user', { userId });

    const params = {
      TableName: TABLES.CARTS,
      Key: { userId },
    };

    await dynamoDbDocClient.send(new DeleteCommand(params));

    log('Cart cleared successfully', { userId });

    return successResponse({ userId }, 'Cart cleared successfully');
  } catch (error: any) {
    logError('Error clearing cart', error);
    return errorResponse('Failed to clear cart', 500, error.message);
  }
};
