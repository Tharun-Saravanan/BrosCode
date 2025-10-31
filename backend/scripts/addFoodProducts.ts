import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDbDocClient, TABLES } from '../src/config/dynamodb';
import { Product } from '../src/types';

// 50 Food Products Data
const foodProducts = [
  {
    name: "Classic Italian Pizza",
    price: 300,
    description: "Authentic Italian pizza with fresh mozzarella, tomato sauce, and basil",
    category: "Pizza",
    images: ["https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Cheese Loaded Burger",
    price: 150,
    description: "Juicy beef patty with melted cheese, lettuce, tomato, and special sauce",
    category: "Burger",
    images: ["https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Salty Fries",
    price: 80,
    description: "Crispy golden french fries with perfect seasoning",
    category: "Fries",
    images: ["https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Tasty Roll Buns",
    price: 100,
    description: "Soft and fluffy buns filled with savory filling",
    category: "Buns",
    images: ["https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Cheesy Sandwich",
    price: 80,
    description: "Grilled sandwich with melted cheese and fresh vegetables",
    category: "Sandwich",
    images: ["https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Butter Popcorn",
    price: 200,
    description: "Fresh popped corn with rich butter flavor",
    category: "Popcorn",
    images: ["https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Margherita Pizza",
    price: 280,
    description: "Classic pizza with tomato, mozzarella, and fresh basil",
    category: "Pizza",
    images: ["https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Veggie Burger",
    price: 130,
    description: "Healthy vegetarian burger with grilled vegetables",
    category: "Burger",
    images: ["https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Curly Fries",
    price: 90,
    description: "Spiral-cut potatoes fried to perfection",
    category: "Fries",
    images: ["https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Cinnamon Buns",
    price: 120,
    description: "Sweet rolls with cinnamon and cream cheese frosting",
    category: "Buns",
    images: ["https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Club Sandwich",
    price: 95,
    description: "Triple-decker sandwich with chicken, bacon, and vegetables",
    category: "Sandwich",
    images: ["https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Caramel Popcorn",
    price: 220,
    description: "Sweet and crunchy caramel-coated popcorn",
    category: "Popcorn",
    images: ["https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Pepperoni Pizza",
    price: 320,
    description: "Classic pizza loaded with pepperoni slices",
    category: "Pizza",
    images: ["https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Chicken Burger",
    price: 160,
    description: "Crispy fried chicken with mayo and lettuce",
    category: "Burger",
    images: ["https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Sweet Potato Fries",
    price: 100,
    description: "Healthy and delicious sweet potato fries",
    category: "Fries",
    images: ["https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Garlic Bread Buns",
    price: 110,
    description: "Soft buns with garlic butter and herbs",
    category: "Buns",
    images: ["https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Grilled Chicken Sandwich",
    price: 105,
    description: "Grilled chicken breast with fresh vegetables",
    category: "Sandwich",
    images: ["https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Cheese Popcorn",
    price: 210,
    description: "Savory cheese-flavored popcorn",
    category: "Popcorn",
    images: ["https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "BBQ Chicken Pizza",
    price: 340,
    description: "Pizza with BBQ sauce, chicken, and onions",
    category: "Pizza",
    images: ["https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Double Cheese Burger",
    price: 180,
    description: "Two beef patties with double cheese",
    category: "Burger",
    images: ["https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Loaded Cheese Fries",
    price: 120,
    description: "Fries topped with melted cheese and bacon",
    category: "Fries",
    images: ["https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Chocolate Buns",
    price: 130,
    description: "Sweet buns filled with chocolate",
    category: "Buns",
    images: ["https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Tuna Sandwich",
    price: 115,
    description: "Fresh tuna salad sandwich",
    category: "Sandwich",
    images: ["https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Mixed Flavor Popcorn",
    price: 230,
    description: "Combination of sweet and savory popcorn",
    category: "Popcorn",
    images: ["https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Veggie Supreme Pizza",
    price: 290,
    description: "Loaded with fresh vegetables and cheese",
    category: "Pizza",
    images: ["https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Fish Burger",
    price: 140,
    description: "Crispy fish fillet with tartar sauce",
    category: "Burger",
    images: ["https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Peri Peri Fries",
    price: 95,
    description: "Spicy fries with peri peri seasoning",
    category: "Fries",
    images: ["https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Cream Cheese Buns",
    price: 125,
    description: "Soft buns with cream cheese filling",
    category: "Buns",
    images: ["https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "BLT Sandwich",
    price: 100,
    description: "Bacon, lettuce, and tomato sandwich",
    category: "Sandwich",
    images: ["https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Spicy Popcorn",
    price: 205,
    description: "Hot and spicy flavored popcorn",
    category: "Popcorn",
    images: ["https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Hawaiian Pizza",
    price: 310,
    description: "Pizza with ham and pineapple",
    category: "Pizza",
    images: ["https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Mushroom Swiss Burger",
    price: 170,
    description: "Burger with sautéed mushrooms and Swiss cheese",
    category: "Burger",
    images: ["https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Truffle Fries",
    price: 150,
    description: "Gourmet fries with truffle oil",
    category: "Fries",
    images: ["https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Blueberry Buns",
    price: 135,
    description: "Sweet buns with blueberry filling",
    category: "Buns",
    images: ["https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Egg Salad Sandwich",
    price: 85,
    description: "Classic egg salad sandwich",
    category: "Sandwich",
    images: ["https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "BBQ Popcorn",
    price: 215,
    description: "Smoky BBQ flavored popcorn",
    category: "Popcorn",
    images: ["https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Meat Lovers Pizza",
    price: 360,
    description: "Loaded with pepperoni, sausage, and bacon",
    category: "Pizza",
    images: ["https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Spicy Chicken Burger",
    price: 165,
    description: "Spicy fried chicken with jalapeños",
    category: "Burger",
    images: ["https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Garlic Parmesan Fries",
    price: 110,
    description: "Fries tossed with garlic and parmesan",
    category: "Fries",
    images: ["https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Strawberry Buns",
    price: 140,
    description: "Sweet buns with strawberry jam",
    category: "Buns",
    images: ["https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Paneer Tikka Sandwich",
    price: 120,
    description: "Indian-style paneer tikka sandwich",
    category: "Sandwich",
    images: ["https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Chocolate Popcorn",
    price: 240,
    description: "Sweet chocolate-coated popcorn",
    category: "Popcorn",
    images: ["https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Four Cheese Pizza",
    price: 330,
    description: "Pizza with mozzarella, cheddar, parmesan, and blue cheese",
    category: "Pizza",
    images: ["https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Bacon Burger",
    price: 175,
    description: "Burger with crispy bacon strips",
    category: "Burger",
    images: ["https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Cajun Fries",
    price: 105,
    description: "Spicy Cajun-seasoned fries",
    category: "Fries",
    images: ["https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Apple Cinnamon Buns",
    price: 145,
    description: "Buns with apple and cinnamon filling",
    category: "Buns",
    images: ["https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Turkey Sandwich",
    price: 125,
    description: "Sliced turkey with cranberry sauce",
    category: "Sandwich",
    images: ["https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Salted Caramel Popcorn",
    price: 250,
    description: "Sweet and salty caramel popcorn",
    category: "Popcorn",
    images: ["https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Pesto Pizza",
    price: 295,
    description: "Pizza with basil pesto sauce",
    category: "Pizza",
    images: ["https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  },
  {
    name: "Lamb Burger",
    price: 190,
    description: "Gourmet lamb patty with mint sauce",
    category: "Burger",
    images: ["https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]
  }
];

async function addProducts() {
  console.log('🚀 Starting to add 50 food products to DynamoDB...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < foodProducts.length; i++) {
    const productData = foodProducts[i];
    const timestamp = new Date().toISOString();
    const productId = uuidv4();

    const product: Product = {
      products_id: productId,
      name: productData.name,
      price: productData.price,
      description: productData.description,
      category: productData.category,
      imageUrl: productData.images[0], // Add imageUrl field
      images: productData.images,
      imageKeys: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    try {
      const params = {
        TableName: TABLES.PRODUCTS,
        Item: product,
      };

      await dynamoDbDocClient.send(new PutCommand(params));
      successCount++;
      console.log(`✅ [${i + 1}/50] Added: ${product.name} (₹${product.price})`);
    } catch (error: any) {
      errorCount++;
      console.error(`❌ [${i + 1}/50] Failed to add ${productData.name}:`, error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully added: ${successCount} products`);
  console.log(`❌ Failed: ${errorCount} products`);
  console.log(`📦 Total: ${foodProducts.length} products`);
}

// Run the script
addProducts()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
