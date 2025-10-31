#!/usr/bin/env python3
"""
Flask API for Product Recommendation System
Uses collaborative filtering and content-based recommendations
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from typing import Dict, List, Any, Optional
from collections import defaultdict, Counter
import numpy as np

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev')
PORT = int(os.getenv('PORT', 5000))
HOST = os.getenv('HOST', '0.0.0.0')

# Cache for products and user interactions
products_cache = []
user_interactions_cache = defaultdict(lambda: {'cart': [], 'liked': [], 'purchased': []})


def fetch_all_products() -> List[Dict[str, Any]]:
    """Fetch all products from API"""
    global products_cache
    
    if products_cache:
        return products_cache
    
    url = f"{API_BASE_URL}/products"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        products_cache = response.json()
        return products_cache
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []


def fetch_user_dashboard(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch user dashboard data from API"""
    url = f"{API_BASE_URL}/users/{user_id}/dashboard"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('message') == 'User dashboard retrieved successfully':
            return data.get('data')
        return None
    except Exception as e:
        print(f"Error fetching user data: {e}")
        return None


def calculate_product_similarity(product1: Dict, product2: Dict) -> float:
    """Calculate similarity between two products based on category and price"""
    score = 0.0
    
    # Category match (highest weight)
    if product1.get('category') == product2.get('category'):
        score += 0.6
    
    # Price similarity (within 30% range)
    price1 = product1.get('price', 0)
    price2 = product2.get('price', 0)
    if price1 and price2:
        price_diff = abs(price1 - price2) / max(price1, price2)
        if price_diff < 0.3:
            score += 0.4 * (1 - price_diff)
    
    return score


def get_collaborative_recommendations(
    user_context: Dict[str, Any],
    all_products: List[Dict],
    num_recommendations: int = 10
) -> List[Dict[str, Any]]:
    """Generate recommendations using collaborative filtering approach"""
    
    # Get user's interacted product IDs
    cart_ids = {item.get('productId') for item in user_context.get('cart_items', [])}
    liked_ids = {item.get('productId') for item in user_context.get('liked_items', [])}
    interacted_ids = cart_ids | liked_ids
    
    # Get user's interacted products
    interacted_products = [p for p in all_products if p.get('products_id') in interacted_ids]
    
    if not interacted_products:
        # No interaction history - return popular/high-rated items
        return sorted(
            [p for p in all_products if p.get('products_id') not in interacted_ids],
            key=lambda x: x.get('price', 0),
            reverse=True
        )[:num_recommendations]
    
    # Calculate similarity scores for all non-interacted products
    product_scores = []
    for product in all_products:
        if product.get('products_id') in interacted_ids:
            continue
        
        # Calculate average similarity to user's interacted products
        similarities = [
            calculate_product_similarity(product, interacted_prod)
            for interacted_prod in interacted_products
        ]
        avg_similarity = np.mean(similarities) if similarities else 0
        
        # Boost score for items in cart (higher intent)
        if any(item.get('productId') == product.get('products_id') for item in user_context.get('cart_items', [])):
            avg_similarity *= 1.5
        
        product_scores.append((product, avg_similarity))
    
    # Sort by similarity score
    product_scores.sort(key=lambda x: x[1], reverse=True)
    
    return [p[0] for p in product_scores[:num_recommendations]]


def get_category_based_recommendations(
    user_context: Dict[str, Any],
    all_products: List[Dict],
    num_recommendations: int = 10
) -> List[Dict[str, Any]]:
    """Generate recommendations based on category preferences"""
    
    cart_items = user_context.get('cart_items', [])
    liked_items = user_context.get('liked_items', [])
    
    # Get interacted product IDs
    interacted_ids = {item.get('productId') for item in cart_items + liked_items}
    
    # Count category preferences
    category_counts = Counter()
    for item in cart_items:
        category = item.get('category')
        if category:
            category_counts[category] += 2  # Cart items weighted higher
    
    for item in liked_items:
        category = item.get('category')
        if category:
            category_counts[category] += 1
    
    if not category_counts:
        # No preferences - return diverse selection
        return [p for p in all_products if p.get('products_id') not in interacted_ids][:num_recommendations]
    
    # Get top categories
    top_categories = [cat for cat, _ in category_counts.most_common(3)]
    
    # Find products in preferred categories
    recommendations = []
    for product in all_products:
        if product.get('products_id') in interacted_ids:
            continue
        if product.get('category') in top_categories:
            recommendations.append(product)
    
    # Sort by price (descending) within categories
    recommendations.sort(key=lambda x: x.get('price', 0), reverse=True)
    
    return recommendations[:num_recommendations]


def format_recommendations(recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Format recommendations for API response"""
    return [
        {
            'product_id': p.get('products_id'),
            'name': p.get('name'),
            'price': p.get('price'),
            'category': p.get('category'),
            'description': p.get('description'),
            'image_url': p.get('imageUrl'),
            'sizes': p.get('sizes', [])
        }
        for p in recommendations
    ]


# API Routes

@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        'service': 'Product Recommendation System',
        'status': 'running',
        'version': '2.0.0',
        'algorithm': 'collaborative_filtering'
    })


@app.route('/health')
def health():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'api_base_url': API_BASE_URL,
        'endpoints': {
            'recommendations': '/api/recommendations/<user_id>',
            'health': '/health'
        }
    })


@app.route('/api/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """
    Get product recommendations for a user
    Query params:
        - limit: Number of recommendations (default: 5)
        - algorithm: 'collaborative' or 'category' (default: 'collaborative')
    """
    try:
        # Get parameters
        limit = request.args.get('limit', default=5, type=int)
        limit = min(max(limit, 1), 20)
        algorithm = request.args.get('algorithm', default='collaborative', type=str)
        
        # Fetch data
        dashboard_data = fetch_user_dashboard(user_id)
        all_products = fetch_all_products()
        
        if not dashboard_data:
            return jsonify({
                'error': 'Failed to fetch user data',
                'message': 'Could not retrieve user dashboard from API'
            }), 404
        
        if not all_products:
            return jsonify({
                'error': 'Failed to fetch products',
                'message': 'Could not retrieve products from API'
            }), 500
        
        # Extract user context
        cart = dashboard_data.get('cart', {})
        liked = dashboard_data.get('likedProducts', {})
        
        user_context = {
            'cart_items': cart.get('items', []),
            'liked_items': liked.get('products', []),
            'total_cart_items': cart.get('totalItems', 0),
            'total_liked': liked.get('totalLiked', 0)
        }
        
        # Generate recommendations
        if algorithm == 'category':
            recommendations = get_category_based_recommendations(user_context, all_products, limit)
        else:
            recommendations = get_collaborative_recommendations(user_context, all_products, limit)
        
        # Format response
        response = {
            'user_id': user_id,
            'user_context': {
                'cart_items_count': user_context['total_cart_items'],
                'liked_items_count': user_context['total_liked']
            },
            'recommendations': format_recommendations(recommendations),
            'recommendation_count': len(recommendations),
            'algorithm_used': algorithm
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    print(f"\n🚀 Starting Recommendation API on {HOST}:{PORT}")
    print(f"📡 API Base URL: {API_BASE_URL}")
    print(f"🔗 Health check: http://{HOST}:{PORT}/health")
    print(f"🎯 Recommendations: http://{HOST}:{PORT}/api/recommendations/<user_id>\n")
    
    app.run(host=HOST, port=PORT, debug=os.getenv('DEBUG', 'False').lower() == 'true')
