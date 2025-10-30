#!/bin/bash

# Selenium Test Runner Script
# Usage: ./run_tests.sh [test_type]
# test_type: all, login, navigation, forms, products, cart, load, or specific test file

cd "$(dirname "$0")/.."

# Set environment variables
export APP_BASE_URL="http://localhost:5173"
export TEST_EMAIL="tharun.s@prasklatechnology.com"
export TEST_PASSWORD="Tharun1234*"
export TEST_RUNS="3"

# Activate virtual environment
source testing/.venv/bin/activate

echo "🧪 Selenium Test Suite for BrosCode"
echo "===================================="
echo ""

# Determine which tests to run
TEST_TYPE=${1:-all}

case $TEST_TYPE in
  "login")
    echo "Running Login Tests..."
    pytest testing/test_login.py -v
    ;;
  "navigation")
    echo "Running Navigation Tests..."
    pytest testing/test_navigation.py -v
    ;;
  "forms")
    echo "Running Form Validation Tests..."
    pytest testing/test_forms.py -v
    ;;
  "products")
    echo "Running Product Tests..."
    pytest testing/test_products.py -v
    ;;
  "cart")
    echo "Running Cart Functionality Tests..."
    pytest testing/test_cart_functionality.py -v
    ;;
  "load")
    echo "Running Load Tests..."
    pytest testing/test_load.py -v -m "not slow"
    ;;
  "load-full")
    echo "Running Full Load Tests (including slow tests)..."
    pytest testing/test_load.py -v
    ;;
  "quick")
    echo "Running Quick Test Suite..."
    pytest testing/ -v -m "not slow" -k "not load"
    ;;
  "all")
    echo "Running All Tests (excluding slow tests)..."
    pytest testing/ -v -m "not slow"
    ;;
  *)
    echo "Running specific test: $TEST_TYPE"
    pytest testing/$TEST_TYPE -v
    ;;
esac

echo ""
echo "✅ Tests completed!"
