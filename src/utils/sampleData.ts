import type { Product } from '../types/product';

export const sampleProducts: Product[] = [
  {
    products_id: '1',
    id: '1', // Keep for backward compatibility
    name: 'Classic White Sneakers',
    price: 89.99,
    description: 'Comfortable white sneakers perfect for everyday wear. Made with premium materials and modern design.',
    
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800'
    ],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    products_id: '2',
    id: '2', // Keep for backward compatibility
    name: 'Black Running Shoes',
    price: 129.99,
    description: 'High-performance running shoes with advanced cushioning and breathable mesh upper.',
    
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'
    ],
    createdAt: new Date('2024-01-14').toISOString(),
    updatedAt: new Date('2024-01-14').toISOString(),
  },
  {
    products_id: '3',
    id: '3', // Keep for backward compatibility
    name: 'Brown Leather Boots',
    price: 199.99,
    description: 'Premium leather boots with durable construction. Perfect for both casual and formal occasions.',
    
    imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400',
    createdAt: new Date('2024-01-13').toISOString(),
    updatedAt: new Date('2024-01-13').toISOString(),
  },
  {
    products_id: '4',
    id: '4', // Keep for backward compatibility
    name: 'Summer Sandals',
    price: 59.99,
    description: 'Lightweight and comfortable sandals perfect for summer activities and beach walks.',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString(),
  },
  {
    products_id: '5',
    id: '5', // Keep for backward compatibility
    name: 'Formal Oxford Shoes',
    price: 159.99,
    description: 'Classic oxford shoes crafted from genuine leather. Essential for business and formal events.',
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
    createdAt: new Date('2024-01-11').toISOString(),
    updatedAt: new Date('2024-01-11').toISOString(),
  },
];

// Function to initialize sample data in localStorage
export const initializeSampleData = (): void => {
  const existingData = localStorage.getItem('temp_products');
  if (!existingData) {
    localStorage.setItem('temp_products', JSON.stringify(sampleProducts));
    console.log('Sample product data initialized in localStorage');
  }
};
