import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { 
  successResponse, 
  errorResponse, 
  calculateCartTotals,
  getTimestamp,
  log,
  logError 
} from '../../utils/response';
import { Cart } from '../../types';

/**
 * Remove item from cart
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;
    const itemId = event.pathParameters?.itemId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    if (!itemId) {
      return errorResponse('Item ID is required', 400);
    }

    log('Removing item from cart', { userId, itemId });

    // Get existing cart
    const getParams = {
      TableName: TABLES.CARTS,
      Key: { userId },
    };

    const existingCart = await dynamoDbDocClient.send(new GetCommand(getParams));
    const cart = existingCart.Item as Cart | undefined;

    if (!cart) {
      return errorResponse('Cart not found', 404);
    }

    // Remove the item
    const items = cart.items.filter(item => item.id !== itemId);

    if (items.length === cart.items.length) {
      return errorResponse('Item not found in cart', 404);
    }

    const timestamp = getTimestamp();
    const { totalItems, totalPrice } = calculateCartTotals(items);

    const updatedCart: Cart = {
      userId,
      items,
      totalItems,
      totalPrice,
      createdAt: cart.createdAt,
      updatedAt: timestamp,
    };

    const putParams = {
      TableName: TABLES.CARTS,
      Item: updatedCart,
    };

    await dynamoDbDocClient.send(new PutCommand(putParams));

    log('Item removed from cart successfully', { userId, itemId });

    return successResponse(updatedCart, 'Item removed from cart successfully');
  } catch (error: any) {
    logError('Error removing item from cart', error);
    return errorResponse('Failed to remove item from cart', 500, error.message);
  }
};
