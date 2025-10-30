import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { successResponse, errorResponse, log, logError } from '../../utils/response';

/**
 * Get user's liked products
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    log('Getting liked products for user', { userId });

    const params = {
      TableName: TABLES.LIKED,
      Key: {
        userId: userId,
      },
    };

    const result = await dynamoDbDocClient.send(new GetCommand(params));

    if (!result.Item) {
      // Return empty liked list if not found
      const emptyLiked = {
        userId,
        products: [],
        totalLiked: 0,
      };
      return successResponse(emptyLiked, 'No liked products found');
    }

    log('Liked products retrieved successfully', { userId });

    return successResponse(result.Item, 'Liked products retrieved successfully');
  } catch (error: any) {
    logError('Error getting liked products', error);
    return errorResponse('Failed to retrieve liked products', 500, error.message);
  }
};
