import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const region = process.env.REGION || 'us-east-2';

// Create DynamoDB Client
const client = new DynamoDBClient({ region });

// Create DynamoDB Document Client for easier operations
export const dynamoDbDocClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Table names from environment variables
export const TABLES = {
  PRODUCTS: process.env.PRODUCTS_TABLE || 'sibilingshoe-products',
  CARTS: process.env.CARTS_TABLE || 'sibilingshoe-carts',
  LIKED: process.env.LIKED_TABLE || 'sibilingshoe-liked',
};
