#!/usr/bin/env python3
"""
AI Product Recommendation System
Uses the dashboard API to fetch user data and GPT-2 model for recommendations
"""

import os
import json
import requests
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

# Load environment variables
load_dotenv()

class ProductRecommendationAI:
    """AI system for product recommendations based on user behavior"""
    
    def __init__(self):
        self.api_base_url = os.getenv('API_BASE_URL', 'https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev')
        self.model_name = os.getenv('HF_MODEL_NAME', 'MuthanaH/GPT2-Product-Recommendation-System')
        self.model = None
        self.tokenizer = None
        self._load_model()
    
    def _load_model(self):
        """Load GPT-2 recommendation model from Hugging Face"""
        print(f"Loading model: {self.model_name}...")
        try:
            self.tokenizer = GPT2Tokenizer.from_pretrained(self.model_name)
            self.model = GPT2LMHeadModel.from_pretrained(self.model_name)
            self.model.eval()
            print("✓ Model loaded successfully")
        except Exception as e:
            print(f"⚠ Warning: Could not load model: {e}")
            print("  Falling back to rule-based recommendations")
    
    def fetch_user_dashboard(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user dashboard data from API"""
        url = f"{self.api_base_url}/users/{user_id}/dashboard"
        
        try:
            print(f"Fetching data for user: {user_id}...")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('message') == 'User dashboard retrieved successfully':
                print("✓ User data retrieved successfully")
                return data.get('data')
            else:
                print(f"⚠ Unexpected response: {data.get('message')}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"✗ Error fetching user data: {e}")
            return None
    
    def _extract_user_context(self, dashboard_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract relevant context from dashboard data"""
        cart = dashboard_data.get('cart', {})
        liked = dashboard_data.get('likedProducts', {})
        all_products = dashboard_data.get('allProducts', [])
        
        # Extract product IDs and names from cart
        cart_items = [
            {
                'id': item.get('productId'),
                'name': item.get('name'),
                'category': item.get('category'),
                'quantity': item.get('quantity')
            }
            for item in cart.get('items', [])
        ]
        
        # Extract liked product IDs
        liked_items = [
            {
                'id': prod.get('productId'),
                'name': prod.get('productName')
            }
            for prod in liked.get('products', [])
        ]
        
        # Categorize all products
        products_by_category = {}
        for product in all_products:
            category = product.get('category', 'Uncategorized')
            if category not in products_by_category:
                products_by_category[category] = []
            products_by_category[category].append(product)
        
        return {
            'cart_items': cart_items,
            'liked_items': liked_items,
            'all_products': all_products,
            'products_by_category': products_by_category,
            'total_cart_items': cart.get('totalItems', 0),
            'total_liked': liked.get('totalLiked', 0)
        }
    
    def _build_prompt(self, context: Dict[str, Any]) -> str:
        """Build GPT-2 prompt from user context"""
        prompt_parts = []
        
        # Add cart items
        if context['cart_items']:
            cart_ids = [item['id'] for item in context['cart_items']]
            prompt_parts.append(f"User cart: {', '.join(cart_ids)}")
        
        # Add liked items
        if context['liked_items']:
            liked_ids = [item['id'] for item in context['liked_items']]
            prompt_parts.append(f"User liked: {', '.join(liked_ids)}")
        
        # Add request for recommendation
        prompt_parts.append("Recommend next products:")
        
        return " | ".join(prompt_parts)
    
    def _generate_recommendations_with_model(
        self, 
        context: Dict[str, Any], 
        num_recommendations: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate recommendations using GPT-2 model"""
        if not self.model or not self.tokenizer:
            return self._generate_fallback_recommendations(context, num_recommendations)
        
        prompt = self._build_prompt(context)
        
        try:
            # Tokenize input
            inputs = self.tokenizer.encode(prompt, return_tensors='pt')
            
            # Generate recommendations
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=200,
                    num_return_sequences=1,
                    temperature=0.8,
                    do_sample=True,
                    top_k=50,
                    top_p=0.95
                )
            
            # Decode output
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Parse recommended product IDs from generated text
            # This is simplified - you'd need to fine-tune based on actual model output format
            recommended_ids = self._extract_product_ids_from_text(generated_text, context)
            
            return self._map_ids_to_products(recommended_ids, context['all_products'])
            
        except Exception as e:
            print(f"⚠ Model generation failed: {e}")
            return self._generate_fallback_recommendations(context, num_recommendations)
    
    def _extract_product_ids_from_text(
        self, 
        text: str, 
        context: Dict[str, Any]
    ) -> List[str]:
        """Extract product IDs from generated text"""
        # Simple extraction - look for product IDs in the text
        product_ids = []
        for product in context['all_products']:
            if product['products_id'] in text or product['name'].lower() in text.lower():
                product_ids.append(product['products_id'])
        return product_ids[:5]  # Return top 5
    
    def _generate_fallback_recommendations(
        self, 
        context: Dict[str, Any], 
        num_recommendations: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate recommendations using rule-based logic"""
        print("Using rule-based recommendation engine...")
        
        recommendations = []
        all_products = context['all_products']
        
        # Get IDs of items already in cart or liked
        cart_ids = {item['id'] for item in context['cart_items']}
        liked_ids = {item['id'] for item in context['liked_items']}
        excluded_ids = cart_ids | liked_ids
        
        # Strategy 1: Recommend from same categories as cart items
        if context['cart_items']:
            cart_categories = {item['category'] for item in context['cart_items']}
            for product in all_products:
                if (product['products_id'] not in excluded_ids and 
                    product.get('category') in cart_categories):
                    recommendations.append(product)
                    if len(recommendations) >= num_recommendations:
                        return recommendations
        
        # Strategy 2: Recommend from same categories as liked items
        if context['liked_items'] and len(recommendations) < num_recommendations:
            # Get full product details for liked items
            liked_products = [
                p for p in all_products 
                if p['products_id'] in liked_ids
            ]
            liked_categories = {p.get('category') for p in liked_products}
            
            for product in all_products:
                if (product['products_id'] not in excluded_ids and 
                    product.get('category') in liked_categories and
                    product not in recommendations):
                    recommendations.append(product)
                    if len(recommendations) >= num_recommendations:
                        return recommendations
        
        # Strategy 3: Recommend popular/highest-priced items (assume premium = popular)
        if len(recommendations) < num_recommendations:
            sorted_products = sorted(
                [p for p in all_products if p['products_id'] not in excluded_ids],
                key=lambda x: x.get('price', 0),
                reverse=True
            )
            
            for product in sorted_products:
                if product not in recommendations:
                    recommendations.append(product)
                    if len(recommendations) >= num_recommendations:
                        return recommendations
        
        return recommendations
    
    def _map_ids_to_products(
        self, 
        product_ids: List[str], 
        all_products: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Map product IDs to full product objects"""
        product_map = {p['products_id']: p for p in all_products}
        return [product_map[pid] for pid in product_ids if pid in product_map]
    
    def get_recommendations(
        self, 
        user_id: str, 
        num_recommendations: int = 5,
        use_model: bool = True
    ) -> Optional[Dict[str, Any]]:
        """Get product recommendations for a user"""
        # Fetch user dashboard data
        dashboard_data = self.fetch_user_dashboard(user_id)
        
        if not dashboard_data:
            return None
        
        # Extract context
        context = self._extract_user_context(dashboard_data)
        
        # Generate recommendations
        if use_model:
            recommendations = self._generate_recommendations_with_model(
                context, 
                num_recommendations
            )
        else:
            recommendations = self._generate_fallback_recommendations(
                context, 
                num_recommendations
            )
        
        # Build response
        return {
            'user_id': user_id,
            'user_context': {
                'cart_items_count': context['total_cart_items'],
                'liked_items_count': context['total_liked'],
                'cart_items': context['cart_items'],
                'liked_items': context['liked_items']
            },
            'recommendations': [
                {
                    'product_id': p['products_id'],
                    'name': p.get('name'),
                    'price': p.get('price'),
                    'category': p.get('category'),
                    'description': p.get('description'),
                    'image_url': p.get('imageUrl'),
                    'sizes': p.get('sizes', [])
                }
                for p in recommendations
            ],
            'recommendation_count': len(recommendations)
        }
    
    def print_recommendations(self, result: Dict[str, Any]):
        """Pretty print recommendations"""
        if not result:
            print("No recommendations available")
            return
        
        print("\n" + "="*70)
        print(f"PRODUCT RECOMMENDATIONS FOR USER: {result['user_id']}")
        print("="*70)
        
        context = result['user_context']
        print(f"\n📊 USER ACTIVITY:")
        print(f"   • Cart Items: {context['cart_items_count']}")
        print(f"   • Liked Items: {context['liked_items_count']}")
        
        if context['cart_items']:
            print(f"\n🛒 IN CART:")
            for item in context['cart_items']:
                print(f"   • {item['name']} ({item['category']}) x{item['quantity']}")
        
        if context['liked_items']:
            print(f"\n❤️  LIKED:")
            for item in context['liked_items']:
                print(f"   • {item['name']}")
        
        print(f"\n🎯 RECOMMENDED FOR YOU ({result['recommendation_count']} items):")
        print("-" * 70)
        
        for i, rec in enumerate(result['recommendations'], 1):
            print(f"\n{i}. {rec['name']}")
            print(f"   Category: {rec['category']}")
            print(f"   Price: ₹{rec['price']}")
            print(f"   Description: {rec['description']}")
            if rec.get('sizes'):
                print(f"   Sizes: {', '.join(rec['sizes'])}")
        
        print("\n" + "="*70 + "\n")


def main():
    """Main function to run the AI recommendation system"""
    import sys
    
    # Initialize AI system
    ai = ProductRecommendationAI()
    
    # Get user ID from command line or use default
    user_id = sys.argv[1] if len(sys.argv) > 1 else 'test-user-123'
    
    # Get number of recommendations
    num_recs = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    # Get recommendations
    print(f"\n🤖 AI Product Recommendation System")
    print(f"{'='*70}\n")
    
    result = ai.get_recommendations(user_id, num_recommendations=num_recs)
    
    if result:
        ai.print_recommendations(result)
        
        # Also save to JSON file
        output_file = f'recommendations_{user_id}.json'
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"💾 Recommendations saved to: {output_file}")
    else:
        print("❌ Failed to generate recommendations")
        sys.exit(1)


if __name__ == '__main__':
    main()
