// AWS Configuration for E-commerce Application
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

// Get configuration from environment variables with fallbacks
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] || fallback;
  if (!value) {
    console.warn(`⚠️ Environment variable ${key} is not set`);
  }
  return value || '';
};

// AWS Configuration from environment variables
export const AWS_CONFIG = {
  region: getEnvVar('VITE_AWS_REGION', 'us-east-2'),
  userPoolId: getEnvVar('VITE_AWS_USER_POOL_ID', 'us-east-2_YNAdCDe2j'),
  userPoolClientId: getEnvVar('VITE_AWS_USER_POOL_CLIENT_ID', '32vbughavo7m26avsop9rhuf94'),
  userPoolClientSecret: getEnvVar('VITE_AWS_USER_POOL_CLIENT_SECRET', '19r34epevkcl69b136niii557cvq0isi8e0auh4386gljgshu4bu'),
  identityPoolId: getEnvVar('VITE_AWS_IDENTITY_POOL_ID', 'us-east-2:7b04f661-b873-4ce0-8d0f-4b9593159fbe'),
  tokenSigningUrl: getEnvVar('VITE_AWS_TOKEN_SIGNING_URL', 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YNAdCDe2j/.well-known/jwks.json'),
  dynamoDbTableName: getEnvVar('VITE_DYNAMODB_TABLE_NAME', 'ShoesProducts'),
  dynamoDbPartitionKey: getEnvVar('VITE_DYNAMODB_PARTITION_KEY', 'products_id'),
  // Cart table configuration
  cartTableName: getEnvVar('VITE_DYNAMODB_CART_TABLE_NAME', 'ShoesUserCarts'),
  // S3 Configuration
  s3BucketName: getEnvVar('VITE_S3_BUCKET_NAME', 'siblingshoe-bucket'),
  s3Region: getEnvVar('VITE_S3_REGION', 'us-east-2'),
  // Real-time sync configuration
  syncPollingInterval: parseInt(getEnvVar('VITE_SYNC_POLLING_INTERVAL', '10000')), // 10 seconds
  enableRealTimeSync: getEnvVar('VITE_ENABLE_REAL_TIME_SYNC', 'true') === 'true',
} as const;

// Create Cognito Identity Provider Client
export const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_CONFIG.region,
});

// Create DynamoDB Client with Cognito Identity Pool credentials
export const dynamoDbClient = new DynamoDBClient({
  region: AWS_CONFIG.region,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: AWS_CONFIG.region },
    identityPoolId: AWS_CONFIG.identityPoolId,
  }),
});

// Create DynamoDB Document Client for easier operations
export const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

// Create S3 Client with Cognito Identity Pool credentials
export const s3Client = new S3Client({
  region: AWS_CONFIG.s3Region,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: AWS_CONFIG.s3Region },
    identityPoolId: AWS_CONFIG.identityPoolId,
  }),
});

// Environment validation
export const validateAWSConfig = () => {
  const requiredConfig = [
    'region',
    'userPoolId',
    'userPoolClientId',
    'userPoolClientSecret',
    'identityPoolId',
    'dynamoDbTableName'
  ];

  const missingConfig = requiredConfig.filter(key => {
    const value = AWS_CONFIG[key as keyof typeof AWS_CONFIG];
    return !value || value === '';
  });

  if (missingConfig.length > 0) {
    console.error(`❌ Missing AWS configuration: ${missingConfig.join(', ')}`);
    console.warn('⚠️ Using fallback values for development. Please set environment variables for production.');
    return false;
  }

  console.log('✅ AWS Configuration validated successfully');
  return true;
};

// Health check for AWS services
export const checkAWSHealth = async (): Promise<{
  cognito: boolean;
  dynamodb: boolean;
  overall: boolean;
}> => {
  const health = {
    cognito: false,
    dynamodb: false,
    overall: false,
  };

  try {
    // Test Cognito connection
    await cognitoClient.send({ input: {} } as any);
    health.cognito = true;
  } catch (error) {
    console.warn('⚠️ Cognito health check failed:', error);
  }

  try {
    // Test DynamoDB connection
    await dynamoDbDocClient.send({} as any);
    health.dynamodb = true;
  } catch (error) {
    console.warn('⚠️ DynamoDB health check failed:', error);
  }

  health.overall = health.cognito && health.dynamodb;
  return health;
};

// DynamoDB Query helpers
export const DYNAMODB_QUERIES = {
  // Get all products
  getAllProducts: {
    TableName: AWS_CONFIG.dynamoDbTableName,
  },

  // Category feature removed

  // Get single product
  getProduct: (products_id: string) => ({
    TableName: AWS_CONFIG.dynamoDbTableName,
    Key: {
      products_id: products_id,
    },
  }),

  // Cart operations
  getUserCart: (userId: string) => ({
    TableName: AWS_CONFIG.cartTableName,
    Key: {
      userId: userId,
      cartType: 'active',
    },
  }),

  saveUserCart: (userId: string, cartData: any) => ({
    TableName: AWS_CONFIG.cartTableName,
    Item: {
      userId: userId,
      cartType: 'active',
      items: cartData.items,
      totalItems: cartData.totalItems,
      totalPrice: cartData.totalPrice,
      updatedAt: new Date().toISOString(),
      createdAt: cartData.createdAt || new Date().toISOString(),
      // TTL for 30 days (optional cleanup)
      expiresAt: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    },
  }),

  deleteUserCart: (userId: string) => ({
    TableName: AWS_CONFIG.cartTableName,
    Key: {
      userId: userId,
      cartType: 'active',
    },
  }),
} as const;
