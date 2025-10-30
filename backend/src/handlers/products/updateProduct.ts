import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../../config/dynamodb';
import { 
  successResponse, 
  errorResponse, 
  parseBody,
  getTimestamp,
  log,
  logError 
} from '../../utils/response';
import { Product } from '../../types';

/**
 * Update an existing product
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.id;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const body = parseBody<Partial<Product>>(event.body);

    if (!body) {
      return errorResponse('Request body is required', 400);
    }

    log('Updating product', { productId, body });

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

    // Merge with existing product and update timestamp
    const updatedProduct: Product = {
      ...(existingProduct.Item as Product),
      ...body,
      products_id: productId, // Ensure ID doesn't change
      updatedAt: getTimestamp(),
      createdAt: existingProduct.Item.createdAt, // Preserve creation timestamp
    };

    const putParams = {
      TableName: TABLES.PRODUCTS,
      Item: updatedProduct,
    };

    await dynamoDbDocClient.send(new PutCommand(putParams));

    log('Product updated successfully', { productId });

    return successResponse(updatedProduct, 'Product updated successfully');
  } catch (error: any) {
    logError('Error updating product', error);
    return errorResponse('Failed to update product', 500, error.message);
  }
};
