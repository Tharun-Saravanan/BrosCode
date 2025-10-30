#!/usr/bin/env python3
"""
Flask API for AI Product Recommendation System
Provides RESTful endpoints for product recommendations
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from typing import Dict, List, Any, Optional
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev')
MODEL_NAME = os.getenv('HF_MODEL_NAME', 'MuthanaH/GPT2-Product-Recommendation-System')
PORT = int(os.getenv('PORT', 5000))
HOST = os.getenv('HOST', '0.0.0.0')

# Global model variables
model = None
tokenizer = None


def load_model():
    """Load GPT-2 recommendation model from Hugging Face"""
    global model, tokenizer
    print(f"Loading model: {MODEL_NAME}...")
    try:
        tokenizer = GPT2Tokenizer.from_pretrained(MODEL_NAME)
        model = GPT2LMHeadModel.from_pretrained(MODEL_NAME)
        model.eval()
        print("✓ Model loaded successfully")
        return True
    except Exception as e:
        print(f"⚠ Warning: Could not load model: {e}")
        print("  Using rule-based recommendations only")
        return False


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
    except requests.exceptions.RequestException as e:
        print(f"Error fetching user data: {e}")
        return None


def extract_user_context(dashboard_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract relevant context from dashboard data"""
    cart = dashboard_data.get('cart', {})
    liked = dashboard_data.get('likedProducts', {})
    all_products = dashboard_data.get('allProducts', [])
    
    cart_items = [
        {
            'id': item.get('productId'),
            'name': item.get('name'),
            'category': item.get('category'),
            'quantity': item.get('quantity')
        }
        for item in cart.get('items', [])
    ]
    
    liked_items = [
        {
            'id': prod.get('productId'),
            'name': prod.get('productName')
        }
        for prod in liked.get('products', [])
    ]
    
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


def generate_fallback_recommendations(
    context: Dict[str, Any], 
    num_recommendations: int = 5
) -> List[Dict[str, Any]]:
    """Generate recommendations using rule-based logic"""
    recommendations = []
    all_products = context['all_products']
    
    cart_ids = {item['id'] for item in context['cart_items']}
    liked_ids = {item['id'] for item in context['liked_items']}
    excluded_ids = cart_ids | liked_ids
    
    # Strategy 1: Same categories as cart items
    if context['cart_items']:
        cart_categories = {item['category'] for item in context['cart_items']}
        for product in all_products:
            if (product['products_id'] not in excluded_ids and 
                product.get('category') in cart_categories):
                recommendations.append(product)
                if len(recommendations) >= num_recommendations:
                    return recommendations
    
    # Strategy 2: Same categories as liked items
    if context['liked_items'] and len(recommendations) < num_recommendations:
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
    
    # Strategy 3: Premium/popular items
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


def format_recommendations(recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Format recommendations for API response"""
    return [
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
    ]


# API Routes

@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        'service': 'AI Product Recommendation System',
        'status': 'running',
        'version': '1.0.0',
        'model_loaded': model is not None
    })


@app.route('/health')
def health():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'api_base_url': API_BASE_URL,
        'model_status': 'loaded' if model else 'fallback',
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
    """
    try:
        # Get limit from query params
        limit = request.args.get('limit', default=5, type=int)
        limit = min(max(limit, 1), 20)  # Clamp between 1 and 20
        
        # Fetch user dashboard data
        dashboard_data = fetch_user_dashboard(user_id)
        
        if not dashboard_data:
            return jsonify({
                'error': 'Failed to fetch user data',
                'message': 'Could not retrieve user dashboard from API'
            }), 404
        
        # Extract context
        context = extract_user_context(dashboard_data)
        
        # Generate recommendations (fallback for now)
        recommendations = generate_fallback_recommendations(context, limit)
        
        # Format response
        response = {
            'user_id': user_id,
            'user_context': {
                'cart_items_count': context['total_cart_items'],
                'liked_items_count': context['total_liked'],
                'cart_items': context['cart_items'],
                'liked_items': context['liked_items']
            },
            'recommendations': format_recommendations(recommendations),
            'recommendation_count': len(recommendations),
            'model_used': 'gpt2' if model else 'rule-based'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.route('/api/recommendations', methods=['POST'])
def batch_recommendations():
    """
    Get recommendations for multiple users
    Request body:
        {
            "user_ids": ["user1", "user2"],
            "limit": 5
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'user_ids' not in data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'user_ids array is required'
            }), 400
        
        user_ids = data['user_ids']
        limit = data.get('limit', 5)
        
        results = {}
        for user_id in user_ids:
            dashboard_data = fetch_user_dashboard(user_id)
            if dashboard_data:
                context = extract_user_context(dashboard_data)
                recommendations = generate_fallback_recommendations(context, limit)
                results[user_id] = {
                    'recommendations': format_recommendations(recommendations),
                    'count': len(recommendations)
                }
            else:
                results[user_id] = {
                    'error': 'Failed to fetch user data'
                }
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    # Try to load model on startup
    load_model()
    
    # Start Flask server
    print(f"\n🚀 Starting AI Recommendation API on {HOST}:{PORT}")
    print(f"📡 API Base URL: {API_BASE_URL}")
    print(f"🔗 Health check: http://{HOST}:{PORT}/health")
    print(f"🎯 Recommendations: http://{HOST}:{PORT}/api/recommendations/<user_id>\n")
    
    app.run(host=HOST, port=PORT, debug=os.getenv('DEBUG', 'False').lower() == 'true')
