import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { 
  successResponse, 
  errorResponse, 
  parseBody,
  validateRequiredFields,
  getTimestamp,
  log,
  logError 
} from '../../utils/response';
import { LikedProductsList } from '../../types';

/**
 * Add product to liked list
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    const body = parseBody<{ productId: string, productName: string }>(event.body);

    if (!body) {
      return errorResponse('Request body is required', 400);
    }

    // Validate required fields
    const { isValid, missingFields } = validateRequiredFields(body, [
      'productId',
      'productName'
    ]);

    if (!isValid) {
      return errorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      );
    }

    log('Adding product to liked list', { userId, productId: body.productId });

    // Get existing liked list
    const getParams = {
      TableName: TABLES.LIKED,
      Key: { userId },
    };

    const existingLiked = await dynamoDbDocClient.send(new GetCommand(getParams));
    const likedList = existingLiked.Item as LikedProductsList | undefined;

    const timestamp = getTimestamp();
    let products = likedList?.products || [];

    // Check if product already liked
    const existingProductIndex = products.findIndex(
      p => p.productId === body.productId
    );

    if (existingProductIndex !== -1) {
      return errorResponse('Product already in liked list', 409);
    }

    // Add new liked product
    products.push({
      productId: body.productId!,
      productName: body.productName!,
      addedAt: timestamp,
    });

    const updatedLikedList: LikedProductsList = {
      userId,
      products,
      totalLiked: products.length,
      createdAt: likedList?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    const putParams = {
      TableName: TABLES.LIKED,
      Item: updatedLikedList,
    };

    await dynamoDbDocClient.send(new PutCommand(putParams));

    log('Product added to liked list successfully', { 
      userId, 
      productId: body.productId,
      totalLiked: products.length 
    });

    return successResponse(updatedLikedList, 'Product added to liked list successfully');
  } catch (error: any) {
    logError('Error adding product to liked list', error);
    return errorResponse('Failed to add product to liked list', 500, error.message);
  }
};
