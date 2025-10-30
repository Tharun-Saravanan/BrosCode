import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { 
  successResponse, 
  errorResponse, 
  parseBody,
  calculateCartTotals,
  getTimestamp,
  log,
  logError 
} from '../../utils/response';
import { Cart, CartItem } from '../../types';

/**
 * Update cart (bulk update items or update item quantity)
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    const body = parseBody<{ items?: CartItem[], itemId?: string, quantity?: number }>(event.body);

    if (!body) {
      return errorResponse('Request body is required', 400);
    }

    log('Updating cart', { userId, body });

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

    let items: CartItem[] = cart.items;

    // If updating specific item quantity
    if (body.itemId && body.quantity !== undefined) {
      const itemIndex = items.findIndex(item => item.id === body.itemId);
      if (itemIndex === -1) {
        return errorResponse('Item not found in cart', 404);
      }

      if (body.quantity === 0) {
        // Remove item if quantity is 0
        items = items.filter(item => item.id !== body.itemId);
      } else {
        items[itemIndex].quantity = body.quantity;
      }
    } 
    // If replacing entire items array
    else if (body.items) {
      items = body.items;
    } else {
      return errorResponse('Either items array or itemId with quantity is required', 400);
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

    log('Cart updated successfully', { userId, itemCount: items.length });

    return successResponse(updatedCart, 'Cart updated successfully');
  } catch (error: any) {
    logError('Error updating cart', error);
    return errorResponse('Failed to update cart', 500, error.message);
  }
};
