import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { successResponse, errorResponse, log, logError } from '../../utils/response';

/**
 * Get a single product by ID
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.id;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    log('Getting product', { productId });

    const params = {
      TableName: TABLES.PRODUCTS,
      Key: {
        products_id: productId,
      },
    };

    const result = await dynamoDbDocClient.send(new GetCommand(params));

    if (!result.Item) {
      return errorResponse('Product not found', 404);
    }

    log('Product retrieved successfully', { productId });

    return successResponse(result.Item, 'Product retrieved successfully');
  } catch (error: any) {
    logError('Error getting product', error);
    return errorResponse('Failed to retrieve product', 500, error.message);
  }
};
