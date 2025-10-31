#!/usr/bin/env python3
"""
AI Product Recommendation System
Uses the dashboard API to fetch user data and Gemini AI for recommendations
"""

import os
import json
import requests
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

class ProductRecommendationAI:
    """AI system for product recommendations based on user behavior"""
    
    def __init__(self):
        self.api_base_url = os.getenv('API_BASE_URL', 'https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev')
        # Try to get Gemini API key from env, fallback to provided key
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        if not self.gemini_api_key:
            self.gemini_api_key = 'AIzaSyBvLE1sDxEDx4kGgxuSO_XiThlBgg9wHso'
            print("Using fallback Gemini API key")
        self.gemini_model = None
        self._load_models()
    
    def _load_models(self):
        """Load Gemini AI model"""
        print(f"Loading Gemini AI model...")
        try:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
            print("✓ Gemini AI (2.0-flash-exp) loaded successfully")
        except Exception as e:
            print(f"⚠ Warning: Could not load Gemini: {e}")
            print("  Will use rule-based recommendations as fallback")
    
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
    
    def _build_gemini_prompt(self, context: Dict[str, Any]) -> str:
        """Build detailed prompt for Gemini AI"""
        prompt_parts = [
            "You are an AI product recommendation assistant for an e-commerce shoe store.",
            "Based on the user's shopping behavior, recommend EXACTLY 4 products that would interest them.",
            ""
        ]
        
        # Add cart information
        if context['cart_items']:
            prompt_parts.append("Items currently in user's cart:")
            for item in context['cart_items']:
                prompt_parts.append(f"  - {item['name']} ({item['category']}) - Quantity: {item['quantity']}")
            prompt_parts.append("")
        
        # Add liked items information
        if context['liked_items']:
            prompt_parts.append("Products the user has liked:")
            for item in context['liked_items']:
                prompt_parts.append(f"  - {item['name']}")
            prompt_parts.append("")
        
        # Add available products
        prompt_parts.append("Available products in the store:")
        for product in context['all_products']:
            prompt_parts.append(
                f"  - ID: {product['products_id']}, Name: {product.get('name')}, "
                f"Category: {product.get('category')}, Price: ₹{product.get('price')}"
            )
        
        prompt_parts.extend([
            "",
            "Based on this information, recommend EXACTLY 4 products by their product IDs.",
            "Do not recommend products already in the cart or liked list.",
            "Consider category preferences and complementary products.",
            "Return ONLY the 4 product IDs, one per line, nothing else."
        ])
        
        return "\n".join(prompt_parts)
    
    def _generate_recommendations_with_gemini(
        self, 
        context: Dict[str, Any], 
        num_recommendations: int = 4
    ) -> List[Dict[str, Any]]:
        """Generate recommendations using Gemini AI"""
        if not self.gemini_model:
            print("Gemini model not available, using fallback...")
            return self._generate_fallback_recommendations(context, num_recommendations)
        
        prompt = self._build_gemini_prompt(context)
        
        try:
            print("Generating recommendations with Gemini AI...")
            response = self.gemini_model.generate_content(prompt)
            
            # Extract product IDs from response
            response_text = response.text.strip()
            print(f"Gemini response: {response_text}")
            
            # Parse product IDs from response (expecting one ID per line)
            recommended_ids = []
            for line in response_text.split('\n'):
                line = line.strip()
                # Check if this line contains a valid product ID
                for product in context['all_products']:
                    if product['products_id'] in line:
                        if product['products_id'] not in recommended_ids:
                            recommended_ids.append(product['products_id'])
                        break
            
            # Ensure we have exactly 4 recommendations
            if len(recommended_ids) < num_recommendations:
                print(f"⚠ Gemini returned only {len(recommended_ids)} recommendations, filling with fallback...")
                fallback_recs = self._generate_fallback_recommendations(context, num_recommendations)
                existing_ids = set(recommended_ids)
                for rec in fallback_recs:
                    if rec['products_id'] not in existing_ids:
                        recommended_ids.append(rec['products_id'])
                        if len(recommended_ids) >= num_recommendations:
                            break
            
            # Limit to exactly num_recommendations
            recommended_ids = recommended_ids[:num_recommendations]
            
            return self._map_ids_to_products(recommended_ids, context['all_products'])
            
        except Exception as e:
            print(f"⚠ Gemini generation failed: {e}")
            return self._generate_fallback_recommendations(context, num_recommendations)
    

    
    def _generate_fallback_recommendations(
        self, 
        context: Dict[str, Any], 
        num_recommendations: int = 4
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
                        return recommendations[:num_recommendations]
        
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
                        return recommendations[:num_recommendations]
        
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
                        return recommendations[:num_recommendations]
        
        return recommendations[:num_recommendations]
    
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
        num_recommendations: int = 4,
        use_gemini: bool = True
    ) -> Optional[Dict[str, Any]]:
        """Get product recommendations for a user"""
        # Fetch user dashboard data
        dashboard_data = self.fetch_user_dashboard(user_id)
        
        if not dashboard_data:
            return None
        
        # Extract context
        context = self._extract_user_context(dashboard_data)
        
        # Generate recommendations using Gemini or fallback
        if use_gemini:
            recommendations = self._generate_recommendations_with_gemini(
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
    
    # Get number of recommendations (default to 4)
    num_recs = int(sys.argv[2]) if len(sys.argv) > 2 else 4
    
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
