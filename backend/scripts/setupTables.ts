import { 
  DynamoDBClient, 
  CreateTableCommand, 
  DescribeTableCommand 
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-2' });

const createCartsTable = async () => {
  const tableName = 'sibilingshoe-carts';

  try {
    // Check if table already exists
    try {
      const describeCommand = new DescribeTableCommand({ TableName: tableName });
      await client.send(describeCommand);
      console.log(`✅ Table ${tableName} already exists`);
      return;
    } catch (error: any) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    // Create the table
    const createCommand = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });

    await client.send(createCommand);
    console.log(`✅ Table ${tableName} created successfully`);
  } catch (error) {
    console.error(`❌ Error creating table ${tableName}:`, error);
    throw error;
  }
};

const createLikedTable = async () => {
  const tableName = 'sibilingshoe-liked';

  try {
    // Check if table already exists
    try {
      const describeCommand = new DescribeTableCommand({ TableName: tableName });
      await client.send(describeCommand);
      console.log(`✅ Table ${tableName} already exists`);
      return;
    } catch (error: any) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    // Create the table
    const createCommand = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });

    await client.send(createCommand);
    console.log(`✅ Table ${tableName} created successfully`);
  } catch (error) {
    console.error(`❌ Error creating table ${tableName}:`, error);
    throw error;
  }
};

const main = async () => {
  console.log('🚀 Starting DynamoDB table setup...\n');

  try {
    await createCartsTable();
    await createLikedTable();
    console.log('\n✅ All tables setup completed successfully!');
  } catch (error) {
    console.error('\n❌ Table setup failed:', error);
    process.exit(1);
  }
};

main();
