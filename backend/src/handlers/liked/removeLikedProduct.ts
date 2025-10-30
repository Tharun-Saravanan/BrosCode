import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { 
  successResponse, 
  errorResponse, 
  getTimestamp,
  log,
  logError 
} from '../../utils/response';
import { LikedProductsList } from '../../types';

/**
 * Remove product from liked list
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;
    const productId = event.pathParameters?.productId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    log('Removing product from liked list', { userId, productId });

    // Get existing liked list
    const getParams = {
      TableName: TABLES.LIKED,
      Key: { userId },
    };

    const existingLiked = await dynamoDbDocClient.send(new GetCommand(getParams));
    const likedList = existingLiked.Item as LikedProductsList | undefined;

    if (!likedList) {
      return errorResponse('Liked list not found', 404);
    }

    // Remove the product
    const products = likedList.products.filter(p => p.productId !== productId);

    if (products.length === likedList.products.length) {
      return errorResponse('Product not found in liked list', 404);
    }

    const timestamp = getTimestamp();

    const updatedLikedList: LikedProductsList = {
      userId,
      products,
      totalLiked: products.length,
      createdAt: likedList.createdAt,
      updatedAt: timestamp,
    };

    const putParams = {
      TableName: TABLES.LIKED,
      Item: updatedLikedList,
    };

    await dynamoDbDocClient.send(new PutCommand(putParams));

    log('Product removed from liked list successfully', { 
      userId, 
      productId,
      totalLiked: products.length 
    });

    return successResponse(updatedLikedList, 'Product removed from liked list successfully');
  } catch (error: any) {
    logError('Error removing product from liked list', error);
    return errorResponse('Failed to remove product from liked list', 500, error.message);
  }
};
