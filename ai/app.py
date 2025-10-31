#!/usr/bin/env python3
"""
Flask API for AI Product Recommendation System
Provides RESTful endpoints for product recommendations
"""

import os
import json
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from typing import Dict, List, Any, Optional
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Setup logging to file
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/ubuntu/ai/app.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev')
PORT = int(os.getenv('PORT', 5000))
HOST = os.getenv('HOST', '0.0.0.0')

# Gemini API configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    GEMINI_API_KEY = 'AIzaSyBvLE1sDxEDx4kGgxuSO_XiThlBgg9wHso'
    print("Using fallback Gemini API key")

# Global model variable
gemini_model = None


def load_model():
    """Load Gemini AI model"""
    global gemini_model
    logger.info(f"Loading Gemini AI model...")
    logger.info(f"API Key present: {bool(GEMINI_API_KEY)}")
    logger.info(f"API Key (first 20 chars): {GEMINI_API_KEY[:20] if GEMINI_API_KEY else 'None'}...")
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        logger.info("✓ Gemini AI (2.0-flash-exp) loaded successfully")
        logger.info(f"Model object: {gemini_model}")
        return True
    except Exception as e:
        logger.error(f"⚠ Warning: Could not load Gemini: {e}")
        logger.error("  Using rule-based recommendations only")
        import traceback
        logger.error(traceback.format_exc())
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


def build_gemini_prompt(context: Dict[str, Any]) -> str:
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


def generate_recommendations_with_gemini(
    context: Dict[str, Any], 
    num_recommendations: int = 4
) -> List[Dict[str, Any]]:
    """Generate recommendations using Gemini AI"""
    logger.info(f"generate_recommendations_with_gemini called, gemini_model is: {gemini_model}")
    if not gemini_model:
        logger.warning("Gemini model not available, using fallback...")
        return generate_fallback_recommendations(context, num_recommendations)
    
    prompt = build_gemini_prompt(context)
    
    try:
        logger.info("Generating recommendations with Gemini AI...")
        response = gemini_model.generate_content(prompt)
        
        # Extract product IDs from response
        response_text = response.text.strip()
        logger.info(f"Gemini response: {response_text}")
        
        # Parse product IDs from response
        recommended_ids = []
        for line in response_text.split('\n'):
            line = line.strip()
            for product in context['all_products']:
                if product['products_id'] in line:
                    if product['products_id'] not in recommended_ids:
                        recommended_ids.append(product['products_id'])
                    break
        
        # Ensure we have exactly num_recommendations
        if len(recommended_ids) < num_recommendations:
            logger.warning(f"⚠ Gemini returned only {len(recommended_ids)} recommendations, filling with fallback...")
            fallback_recs = generate_fallback_recommendations(context, num_recommendations)
            existing_ids = set(recommended_ids)
            for rec in fallback_recs:
                if rec['products_id'] not in existing_ids:
                    recommended_ids.append(rec['products_id'])
                    if len(recommended_ids) >= num_recommendations:
                        break
        
        # Limit to exactly num_recommendations
        recommended_ids = recommended_ids[:num_recommendations]
        
        # Map IDs to products
        product_map = {p['products_id']: p for p in context['all_products']}
        return [product_map[pid] for pid in recommended_ids if pid in product_map]
        
    except Exception as e:
        logger.error(f"⚠ Gemini generation failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return generate_fallback_recommendations(context, num_recommendations)


def generate_fallback_recommendations(
    context: Dict[str, Any], 
    num_recommendations: int = 4
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
                    return recommendations[:num_recommendations]
    
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
                    return recommendations[:num_recommendations]
    
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
                    return recommendations[:num_recommendations]
    
    return recommendations[:num_recommendations]


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
        'version': '2.0.0',
        'model': 'Gemini AI',
        'model_loaded': gemini_model is not None
    })


@app.route('/health')
def health():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'api_base_url': API_BASE_URL,
        'model': 'Gemini AI',
        'model_status': 'loaded' if gemini_model else 'fallback',
        'default_recommendations': 4,
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
        - limit: Number of recommendations (default: 4)
    """
    try:
        # Get limit from query params
        limit = request.args.get('limit', default=4, type=int)
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
        
        # Generate recommendations using Gemini AI
        recommendations = generate_recommendations_with_gemini(context, limit)
        
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
            'model_used': 'gemini-ai' if gemini_model else 'rule-based'
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
        limit = data.get('limit', 4)
        
        results = {}
        for user_id in user_ids:
            dashboard_data = fetch_user_dashboard(user_id)
            if dashboard_data:
                context = extract_user_context(dashboard_data)
                recommendations = generate_recommendations_with_gemini(context, limit)
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


# Load model when module is imported (for gunicorn workers)
logger.info("=" * 60)
logger.info("INITIALIZING AI RECOMMENDATION SERVICE")
logger.info("=" * 60)
load_model()
logger.info("=" * 60)

if __name__ == '__main__':
    # Start Flask server
    logger.info(f"\n🚀 Starting AI Recommendation API on {HOST}:{PORT}")
    logger.info(f"📡 API Base URL: {API_BASE_URL}")
    logger.info(f"🔗 Health check: http://{HOST}:{PORT}/health")
    logger.info(f"🎯 Recommendations: http://{HOST}:{PORT}/api/recommendations/<user_id>\n")
    
    app.run(host=HOST, port=PORT, debug=os.getenv('DEBUG', 'False').lower() == 'true')
