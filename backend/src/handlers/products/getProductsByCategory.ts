import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { successResponse, errorResponse, log, logError } from '../../utils/response';

/**
 * Get products by category
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const category = event.pathParameters?.category;

    if (!category) {
      return errorResponse('Category is required', 400);
    }

    log('Getting products by category', { category });

    const params = {
      TableName: TABLES.PRODUCTS,
      FilterExpression: 'category = :category',
      ExpressionAttributeValues: {
        ':category': category,
      },
    };

    const result = await dynamoDbDocClient.send(new ScanCommand(params));

    log('Products retrieved successfully', { 
      category, 
      count: result.Items?.length 
    });

    return successResponse(result.Items || [], 'Products retrieved successfully');
  } catch (error: any) {
    logError('Error getting products by category', error);
    return errorResponse('Failed to retrieve products', 500, error.message);
  }
};
