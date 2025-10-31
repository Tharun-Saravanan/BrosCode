import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbDocClient, TABLES } from '../src/config/dynamodb';

async function deleteAllProducts() {
  console.log('🗑️  Starting to delete all products from DynamoDB...\n');
  
  try {
    // Scan all products
    const scanParams = {
      TableName: TABLES.PRODUCTS,
    };

    const scanResult = await dynamoDbDocClient.send(new ScanCommand(scanParams));
    const products = scanResult.Items || [];

    console.log(`📦 Found ${products.length} products to delete\n`);

    let deleteCount = 0;
    let errorCount = 0;

    // Delete each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        const deleteParams = {
          TableName: TABLES.PRODUCTS,
          Key: {
            products_id: product.products_id,
          },
        };

        await dynamoDbDocClient.send(new DeleteCommand(deleteParams));
        deleteCount++;
        console.log(`✅ [${i + 1}/${products.length}] Deleted: ${product.name}`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ [${i + 1}/${products.length}] Failed to delete ${product.name}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully deleted: ${deleteCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    console.log(`📦 Total: ${products.length} products`);
  } catch (error: any) {
    console.error('❌ Error scanning products:', error.message);
    throw error;
  }
}

// Run the script
deleteAllProducts()
  .then(() => {
    console.log('\n✨ Deletion completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
