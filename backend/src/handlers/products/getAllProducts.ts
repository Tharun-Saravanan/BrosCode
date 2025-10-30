import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { successResponse, errorResponse, log, logError } from '../../utils/response';

/**
 * Get all products from DynamoDB
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    log('Getting all products', { event });

    const params = {
      TableName: TABLES.PRODUCTS,
    };

    const result = await dynamoDbDocClient.send(new ScanCommand(params));

    log('Products retrieved successfully', { count: result.Items?.length });

    return successResponse(result.Items || [], 'Products retrieved successfully');
  } catch (error: any) {
    logError('Error getting products', error);
    return errorResponse('Failed to retrieve products', 500, error.message);
  }
};
