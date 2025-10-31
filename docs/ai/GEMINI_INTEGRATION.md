# Gemini AI Integration

## Changes Made

### 1. Updated Dependencies
- Added `google-generativeai==0.3.2` to `requirements-simple.txt`

### 2. Environment Configuration
- Added `GEMINI_API_KEY` to `.env` file
- Fallback API key: `AIzaSyBvLE1sDxEDx4kGgxuSO_XiThlBgg9wHso`
- If `GEMINI_API_KEY` is not set in environment, the fallback key is used automatically

### 3. AI Service Updates (`ai/ai.py`)
- Removed GPT-2 and transformers dependencies
- Integrated Gemini AI as the primary recommendation engine
- Changed default recommendations from 5 to **4 products**
- Created `_build_gemini_prompt()` method that provides detailed context to Gemini:
  - User's cart items with categories and quantities
  - User's liked products
  - All available products with IDs, names, categories, and prices
  - Instructions to recommend exactly 4 products
- Updated `_generate_recommendations_with_gemini()` to:
  - Use Gemini API for intelligent recommendations
  - Parse product IDs from Gemini's response
  - Fall back to rule-based recommendations if Gemini fails or returns insufficient results
- Rule-based fallback now returns exactly 4 products

### 4. Flask API Updates (`ai/app.py`)
- Replaced GPT-2 model loading with Gemini AI
- Changed default recommendation count from 5 to **4**
- Updated all endpoints to use Gemini AI
- Added `build_gemini_prompt()` function
- Added `generate_recommendations_with_gemini()` function
- Updated health check to show Gemini AI status
- Version bumped to 2.0.0

## How It Works

1. **Primary**: Gemini AI analyzes user behavior (cart + liked items) and recommends 4 complementary products
2. **Fallback**: If Gemini API fails or returns fewer than 4 products, rule-based logic fills the gap
3. **Rule-based logic**:
   - Recommends from same categories as cart items
   - Recommends from same categories as liked items
   - Recommends premium/popular items

## Testing

To test the integration:

```bash
# Install dependencies
pip install -r ai/requirements-simple.txt

# Run the AI service directly
python ai/ai.py test-user-123

# Or start the Flask API
python ai/app.py
```

## API Usage

```bash
# Get 4 recommendations (default)
curl http://localhost:5000/api/recommendations/test-user-123

# Get custom number of recommendations
curl http://localhost:5000/api/recommendations/test-user-123?limit=6
```
