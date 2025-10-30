import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { successResponse, errorResponse, log, logError } from '../../utils/response';

/**
 * Clear user's liked products list
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    log('Clearing liked products for user', { userId });

    const params = {
      TableName: TABLES.LIKED,
      Key: { userId },
    };

    await dynamoDbDocClient.send(new DeleteCommand(params));

    log('Liked products cleared successfully', { userId });

    return successResponse({ userId }, 'Liked products cleared successfully');
  } catch (error: any) {
    logError('Error clearing liked products', error);
    return errorResponse('Failed to clear liked products', 500, error.message);
  }
};
