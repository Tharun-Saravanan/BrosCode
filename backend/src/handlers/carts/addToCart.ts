import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { 
  successResponse, 
  errorResponse, 
  parseBody,
  validateRequiredFields,
  calculateCartTotals,
  getTimestamp,
  log,
  logError 
} from '../../utils/response';
import { Cart, CartItem } from '../../types';

/**
 * Add item to cart
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    const body = parseBody<Partial<CartItem>>(event.body);

    if (!body) {
      return errorResponse('Request body is required', 400);
    }

    // Validate required fields
    const { isValid, missingFields } = validateRequiredFields(body, [
      'productId',
      'name',
      'price',
      'imageUrl',
      'size',
      'category'
    ]);

    if (!isValid) {
      return errorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      );
    }

    log('Adding item to cart', { userId, item: body });

    // Get existing cart
    const getParams = {
      TableName: TABLES.CARTS,
      Key: { userId },
    };

    const existingCart = await dynamoDbDocClient.send(new GetCommand(getParams));
    const cart = existingCart.Item as Cart | undefined;

    const timestamp = getTimestamp();
    let items: CartItem[] = cart?.items || [];

    // Check if item with same productId and size already exists
    const existingItemIndex = items.findIndex(
      item => item.productId === body.productId && item.size === body.size
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      items[existingItemIndex].quantity += body.quantity || 1;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: uuidv4(),
        productId: body.productId!,
        name: body.name!,
        price: body.price!,
        imageUrl: body.imageUrl!,
        size: body.size!,
        quantity: body.quantity || 1,
        category: body.category!,
      };
      items.push(newItem);
    }

    const { totalItems, totalPrice } = calculateCartTotals(items);

    const updatedCart: Cart = {
      userId,
      items,
      totalItems,
      totalPrice,
      createdAt: cart?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    const putParams = {
      TableName: TABLES.CARTS,
      Item: updatedCart,
    };

    await dynamoDbDocClient.send(new PutCommand(putParams));

    log('Item added to cart successfully', { userId, itemCount: items.length });

    return successResponse(updatedCart, 'Item added to cart successfully');
  } catch (error: any) {
    logError('Error adding item to cart', error);
    return errorResponse('Failed to add item to cart', 500, error.message);
  }
};
