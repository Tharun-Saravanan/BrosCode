#!/usr/bin/env node

/**
 * Script to create DynamoDB table for user carts
 * Run with: node scripts/createCartTable.js
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

// Configuration
const AWS_REGION = process.env.VITE_AWS_REGION || 'us-east-2';
const TABLE_NAME = process.env.VITE_DYNAMODB_CART_TABLE_NAME || 'ShoesUserCarts';

// Create DynamoDB client
const dynamoDbClient = new DynamoDBClient({
  region: AWS_REGION,
});

// Table schema
const tableParams = {
  TableName: TABLE_NAME,
  KeySchema: [
    {
      AttributeName: 'userId',
      KeyType: 'HASH' // Partition key
    },
    {
      AttributeName: 'cartType',
      KeyType: 'RANGE' // Sort key
    }
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'userId',
      AttributeType: 'S' // String
    },
    {
      AttributeName: 'cartType',
      AttributeType: 'S' // String
    }
  ],
  BillingMode: 'PAY_PER_REQUEST', // On-demand billing
  // Optional: Enable TTL for automatic cleanup
  TimeToLiveSpecification: {
    AttributeName: 'expiresAt',
    Enabled: true
  },
  Tags: [
    {
      Key: 'Project',
      Value: 'SiblingShoes'
    },
    {
      Key: 'Environment',
      Value: 'Development'
    },
    {
      Key: 'Purpose',
      Value: 'UserCartStorage'
    }
  ]
};

async function checkTableExists() {
  try {
    const command = new DescribeTableCommand({ TableName: TABLE_NAME });
    await dynamoDbClient.send(command);
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createTable() {
  try {
    console.log(`🔍 Checking if table '${TABLE_NAME}' exists...`);
    
    const exists = await checkTableExists();
    if (exists) {
      console.log(`✅ Table '${TABLE_NAME}' already exists!`);
      return;
    }

    console.log(`📝 Creating table '${TABLE_NAME}'...`);
    
    const command = new CreateTableCommand(tableParams);
    const response = await dynamoDbClient.send(command);
    
    console.log(`✅ Table '${TABLE_NAME}' created successfully!`);
    console.log(`📊 Table ARN: ${response.TableDescription.TableArn}`);
    console.log(`🔑 Partition Key: userId (String)`);
    console.log(`🔑 Sort Key: cartType (String)`);
    console.log(`💰 Billing Mode: Pay per request`);
    console.log(`⏰ TTL Enabled: expiresAt attribute`);
    
    console.log('\n📋 Table Schema:');
    console.log('- userId (String): User ID from Cognito');
    console.log('- cartType (String): "active" for current cart');
    console.log('- items (List): Array of cart items');
    console.log('- totalItems (Number): Total quantity of items');
    console.log('- totalPrice (Number): Total price of cart');
    console.log('- createdAt (String): ISO timestamp');
    console.log('- updatedAt (String): ISO timestamp');
    console.log('- expiresAt (Number): Unix timestamp for TTL (30 days)');
    
    console.log('\n🎯 Usage Examples:');
    console.log('- Get user cart: { userId: "user123", cartType: "active" }');
    console.log('- Save user cart: PUT with all cart data');
    console.log('- Delete user cart: DELETE with userId and cartType');
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 DynamoDB Cart Table Setup');
  console.log('============================');
  console.log(`Region: ${AWS_REGION}`);
  console.log(`Table Name: ${TABLE_NAME}`);
  console.log('');
  
  await createTable();
  
  console.log('\n🎉 Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Verify the table in AWS Console');
  console.log('2. Test cart operations in your application');
  console.log('3. Monitor usage and adjust billing if needed');
}

// Run the script
main().catch(console.error);

export { createTable, checkTableExists };
