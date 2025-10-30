const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  CreateTableCommand,
  DescribeTableCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'sibilingshoe-purchases';

async function createPurchasesTable() {
  try {
    // Check if table already exists
    try {
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      await docClient.send(describeCommand);
      console.log(`✅ Table "${TABLE_NAME}" already exists!`);
      return;
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
      // Table doesn't exist, continue to create it
    }

    console.log(`Creating DynamoDB table: ${TABLE_NAME}...`);

    const params = {
      TableName: TABLE_NAME,
      KeySchema: [{ AttributeName: 'purchaseId', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'purchaseId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UserIdIndex',
          KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };

    const command = new CreateTableCommand(params);
    await docClient.send(command);

    console.log(`✅ Table "${TABLE_NAME}" created successfully!`);
    console.log(`
      Table Configuration:
      - Primary Key: purchaseId (String)
      - Global Secondary Index: UserIdIndex
        - Key: userId (String)
      - Read Capacity: 5 units
      - Write Capacity: 5 units
    `);
  } catch (error) {
    console.error('❌ Error creating purchases table:', error);
    throw error;
  }
}

// Run the script
createPurchasesTable()
  .then(() => {
    console.log('🎉 Purchase table setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Purchase table setup failed:', error);
    process.exit(1);
  });
