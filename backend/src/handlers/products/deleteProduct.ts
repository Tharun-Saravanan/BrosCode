import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { successResponse, errorResponse, log, logError } from '../../utils/response';

/**
 * Delete a product
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.id;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    log('Deleting product', { productId });

    // First, check if product exists
    const getParams = {
      TableName: TABLES.PRODUCTS,
      Key: {
        products_id: productId,
      },
    };

    const existingProduct = await dynamoDbDocClient.send(new GetCommand(getParams));

    if (!existingProduct.Item) {
      return errorResponse('Product not found', 404);
    }

    // Delete the product
    const deleteParams = {
      TableName: TABLES.PRODUCTS,
      Key: {
        products_id: productId,
      },
    };

    await dynamoDbDocClient.send(new DeleteCommand(deleteParams));

    log('Product deleted successfully', { productId });

    return successResponse({ productId }, 'Product deleted successfully');
  } catch (error: any) {
    logError('Error deleting product', error);
    return errorResponse('Failed to delete product', 500, error.message);
  }
};
