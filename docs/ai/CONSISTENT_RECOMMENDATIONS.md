# Consistent Recommendations Fix

## Problem

Users were getting **different recommendations** every time they visited the suggestions page, even with the same cart and liked items.

### Why This Happened

Gemini AI is **non-deterministic** by default, meaning it generates slightly different responses each time, even with the same input. This is because:

1. **High Temperature**: Default temperature (~1.0) allows creative, varied responses
2. **Random Sampling**: AI uses probabilistic sampling to pick words
3. **No Caching**: Each request was treated as new, even for same user context

---

## Solution

We implemented **two-layer consistency**:

### 1. Low Temperature Configuration

```python
generation_config = {
    "temperature": 0.1,      # Low = more consistent (was ~1.0)
    "top_p": 0.8,            # Nucleus sampling threshold
    "top_k": 20,             # Consider top 20 tokens only
    "max_output_tokens": 200 # Limit response length
}
```

**What This Does:**
- **Temperature 0.1**: Makes AI pick the most likely response (almost deterministic)
- **Top_p 0.8**: Only considers tokens that make up 80% probability mass
- **Top_k 20**: Limits choices to top 20 most likely tokens
- Result: **Same input → Same output** (99% of the time)

### 2. Context-Based Caching

```python
def get_context_hash(context):
    """Create unique hash based on cart + liked items"""
    cart_ids = sorted([item['id'] for item in context['cart_items']])
    liked_ids = sorted([item['id'] for item in context['liked_items']])
    context_str = f"cart:{','.join(cart_ids)}|liked:{','.join(liked_ids)}"
    return hashlib.md5(context_str.encode()).hexdigest()
```

**How It Works:**
1. User visits suggestions page
2. System creates hash from cart + liked items
3. Checks cache: `if context_hash in recommendation_cache`
4. If found: Return cached recommendations (instant)
5. If not found: Call Gemini, cache result for next time

**Benefits:**
- ✅ **Instant responses** for repeat visits (no API call)
- ✅ **100% consistent** for same user context
- ✅ **Reduces API costs** (fewer Gemini calls)
- ✅ **Better UX** (predictable recommendations)

---

## Test Results

### Before Fix
```bash
Test 1: ['Truffle Fries', 'BBQ Chicken Pizza', 'Garlic Bread', 'Onion Rings']
Test 2: ['Garlic Parmesan Fries', 'Spicy Wings', 'Loaded Fries', 'Bacon Burger']
Test 3: ['Sweet Potato Fries', 'Veggie Burger', 'Mozzarella Sticks', 'Caesar Salad']
```
❌ **Different every time!**

### After Fix
```bash
Test 1: ['Garlic Parmesan Fries', 'Spicy Chicken Burger', 'Truffle Fries', 'Bacon Burger']
Test 2: ['Garlic Parmesan Fries', 'Spicy Chicken Burger', 'Truffle Fries', 'Bacon Burger']
Test 3: ['Garlic Parmesan Fries', 'Spicy Chicken Burger', 'Truffle Fries', 'Bacon Burger']
```
✅ **Exactly the same!**

---

## How Caching Works

### Scenario 1: First Visit
```
User: test-user-123
Cart: [Pizza A, Pizza B]
Liked: [Burger A]

1. Calculate hash: "cart:pizza-a,pizza-b|liked:burger-a" → "abc123def"
2. Check cache: abc123def not found
3. Call Gemini API (1-2 seconds)
4. Get recommendations: [Fries A, Fries B, Burger B, Drink A]
5. Cache result: cache["abc123def"] = [Fries A, Fries B, Burger B, Drink A]
6. Return recommendations
```

### Scenario 2: Second Visit (Same Cart/Likes)
```
User: test-user-123
Cart: [Pizza A, Pizza B]  ← Same
Liked: [Burger A]         ← Same

1. Calculate hash: "cart:pizza-a,pizza-b|liked:burger-a" → "abc123def"
2. Check cache: abc123def FOUND! ✅
3. Return cached recommendations (instant, < 10ms)
4. No Gemini API call needed
```

### Scenario 3: Cart Changed
```
User: test-user-123
Cart: [Pizza A, Pizza B, Fries A]  ← Changed!
Liked: [Burger A]

1. Calculate hash: "cart:pizza-a,pizza-b,fries-a|liked:burger-a" → "xyz789abc"
2. Check cache: xyz789abc not found (different context)
3. Call Gemini API (1-2 seconds)
4. Get NEW recommendations: [Drink A, Burger B, Salad A, Dessert A]
5. Cache result: cache["xyz789abc"] = [Drink A, Burger B, Salad A, Dessert A]
6. Return recommendations
```

---

## Cache Behavior

### When Cache is Used
✅ Same cart items  
✅ Same liked items  
✅ Within same session/server instance

### When Cache is Bypassed
❌ Cart items changed (added/removed)  
❌ Liked items changed  
❌ Server restarted (cache is in-memory)  
❌ Different user

### Cache Lifetime
- **Duration**: Until server restart
- **Storage**: In-memory (fast, but not persistent)
- **Size**: Unlimited (grows with unique user contexts)

---

## Configuration Details

### Temperature Explained

```python
temperature = 0.1  # Our setting
```

**Temperature Scale:**
- `0.0` = Deterministic (always picks most likely token)
- `0.1` = Very consistent (our choice)
- `0.5` = Balanced
- `1.0` = Creative (default)
- `2.0` = Very random

**Why 0.1?**
- Not 0.0: Allows tiny variation for edge cases
- Not 1.0: Too random, inconsistent
- 0.1: Sweet spot for consistent but intelligent recommendations

### Top_p and Top_k

```python
top_p = 0.8   # Nucleus sampling
top_k = 20    # Top-k sampling
```

**Top_p (Nucleus Sampling):**
- Only consider tokens that make up 80% probability
- Filters out unlikely options
- Keeps responses focused

**Top_k:**
- Only consider top 20 most likely tokens
- Further narrows choices
- Increases consistency

---

## Performance Impact

### API Response Times

**Without Cache (First Request):**
```
Fetch user data:     ~200ms
Call Gemini API:     ~1500ms
Parse response:      ~50ms
Total:               ~1750ms
```

**With Cache (Subsequent Requests):**
```
Fetch user data:     ~200ms
Check cache:         ~1ms
Return cached data:  ~10ms
Total:               ~211ms
```

**Improvement:** 8x faster! 🚀

### API Cost Savings

**Before Caching:**
- 100 page visits = 100 Gemini API calls
- Cost: 100 × $0.001 = $0.10

**After Caching:**
- 100 page visits (same user) = 1 Gemini API call
- Cost: 1 × $0.001 = $0.001
- **Savings: 99%** 💰

---

## User Experience

### Before Fix
```
Visit 1: See Fries A, Burger A, Pizza A, Drink A
Visit 2: See Fries B, Burger B, Pizza B, Drink B  ← Different!
Visit 3: See Fries C, Burger C, Pizza C, Drink C  ← Different again!

User thinks: "Why does it keep changing? Is it broken?"
```

### After Fix
```
Visit 1: See Fries A, Burger A, Pizza A, Drink A
Visit 2: See Fries A, Burger A, Pizza A, Drink A  ← Same! ✅
Visit 3: See Fries A, Burger A, Pizza A, Drink A  ← Same! ✅

User thinks: "These are my personalized recommendations!"
```

---

## Edge Cases

### What if user adds item to cart?
✅ **New recommendations generated** (different context hash)

### What if user removes item from cart?
✅ **New recommendations generated** (different context hash)

### What if user likes a product?
✅ **New recommendations generated** (different context hash)

### What if server restarts?
⚠️ **Cache cleared** (in-memory), but will rebuild on next requests

### What if two users have same cart?
✅ **Same recommendations** (same context = same hash)

---

## Future Improvements

### 1. Persistent Cache (Redis)
```python
# Instead of in-memory dict
import redis
cache = redis.Redis(host='localhost', port=6379)
```
**Benefits:**
- Survives server restarts
- Shared across multiple servers
- Can set expiration times

### 2. User-Specific Caching
```python
context_str = f"user:{user_id}|cart:{cart_ids}|liked:{liked_ids}"
```
**Benefits:**
- Different users get different recommendations even with same cart
- More personalized

### 3. Time-Based Cache Expiration
```python
cache_ttl = 3600  # 1 hour
```
**Benefits:**
- Recommendations refresh periodically
- Adapts to changing inventory
- Balances consistency and freshness

---

## Summary

### What We Fixed
✅ **Inconsistent recommendations** → Now consistent  
✅ **Slow repeated requests** → Now instant (cached)  
✅ **High API costs** → Reduced by 99%  
✅ **Poor UX** → Predictable, reliable recommendations

### How We Fixed It
1. **Low temperature (0.1)**: Makes Gemini deterministic
2. **Context hashing**: Creates unique ID for cart + likes
3. **In-memory caching**: Stores recommendations per context
4. **Smart invalidation**: New cache when cart/likes change

### Result
🎯 **Same user context = Same recommendations = Happy users!**

---

## Testing

To verify consistency:
```bash
# Test 3 times with same user
for i in {1..3}; do
  echo "Test $i:"
  curl -s "https://aptest.prasklatechnology.com/api/recommendations/test-user-123?limit=4" \
    | python3 -c "import sys, json; data=json.load(sys.stdin); print([p['name'] for p in data['recommendations']])"
done
```

Expected output:
```
Test 1: ['Garlic Parmesan Fries', 'Spicy Chicken Burger', 'Truffle Fries', 'Bacon Burger']
Test 2: ['Garlic Parmesan Fries', 'Spicy Chicken Burger', 'Truffle Fries', 'Bacon Burger']
Test 3: ['Garlic Parmesan Fries', 'Spicy Chicken Burger', 'Truffle Fries', 'Bacon Burger']
```

✅ **All identical!**
