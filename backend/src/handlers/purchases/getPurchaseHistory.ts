import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { successResponse, errorResponse } from '../../utils/response';

const client = new DynamoDBClient({ region: process.env.REGION || 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(client);

const PURCHASES_TABLE = process.env.PURCHASES_TABLE || 'sibilingshoe-purchases';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    // Query purchases by userId using GSI
    const result = await docClient.send(
      new QueryCommand({
        TableName: PURCHASES_TABLE,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false, // Sort by newest first
      })
    );

    const purchases = result.Items || [];

    return successResponse({
      purchases,
      totalPurchases: purchases.length,
    }, 'Purchase history retrieved successfully');
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    return errorResponse('Failed to fetch purchase history', 500);
  }
};
