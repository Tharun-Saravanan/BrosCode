import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { successResponse, errorResponse } from '../../utils/response';

const client = new DynamoDBClient({ region: process.env.REGION || 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(client);

const PURCHASES_TABLE = process.env.PURCHASES_TABLE || 'sibilingshoe-purchases';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const purchaseId = event.pathParameters?.purchaseId;

    if (!purchaseId) {
      return errorResponse('Purchase ID is required', 400);
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: PURCHASES_TABLE,
        Key: { purchaseId },
      })
    );

    if (!result.Item) {
      return errorResponse('Purchase not found', 404);
    }

    return successResponse({
      purchase: result.Item,
    }, 'Purchase retrieved successfully');
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return errorResponse('Failed to fetch purchase', 500);
  }
};
