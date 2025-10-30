import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
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
import { Product } from '../../types';

/**
 * Create a new product
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = parseBody<Partial<Product>>(event.body);

    if (!body) {
      return errorResponse('Request body is required', 400);
    }

    // Validate required fields
    const { isValid, missingFields } = validateRequiredFields(body, [
      'name',
      'price',
      'description',
      'category'
    ]);

    if (!isValid) {
      return errorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      );
    }

    const timestamp = getTimestamp();
    const productId = uuidv4();

    const product: Product = {
      products_id: productId,
      name: body.name!,
      price: body.price!,
      description: body.description!,
      category: body.category!,
      images: body.images || [],
      imageKeys: body.imageKeys || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    log('Creating product', { product });

    const params = {
      TableName: TABLES.PRODUCTS,
      Item: product,
    };

    await dynamoDbDocClient.send(new PutCommand(params));

    log('Product created successfully', { productId });

    return successResponse(product, 'Product created successfully', 201);
  } catch (error: any) {
    logError('Error creating product', error);
    return errorResponse('Failed to create product', 500, error.message);
  }
};
