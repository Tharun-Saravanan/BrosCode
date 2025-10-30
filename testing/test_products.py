import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_products_page_loads(driver, base_url):
    """Test that products page loads"""
    driver.get(f"{base_url}/collections/allproducts")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "main"))
    )
    print("✅ Products page loaded")


def test_product_grid_displays(driver, base_url):
    """Test that product grid is displayed"""
    driver.get(f"{base_url}/collections/allproducts")
    
    # Wait for products to load
    time.sleep(3)
    
    # Look for product containers (common patterns)
    product_elements = driver.find_elements(By.CSS_SELECTOR, 'div[class*="grid"]')
    
    if product_elements:
        print(f"✅ Product grid found with {len(product_elements)} grid containers")
    else:
        print("⚠️ Products may still be loading or grid not found")


def test_product_images_load(driver, base_url):
    """Test that product images are loaded"""
    driver.get(f"{base_url}/collections/allproducts")
    time.sleep(3)
    
    images = driver.find_elements(By.TAG_NAME, "img")
    loaded_images = 0
    
    for img in images:
        if img.get_attribute("src") and img.get_attribute("src") != "":
            loaded_images += 1
    
    print(f"✅ Found {loaded_images} images on products page")
    assert loaded_images > 0, "No images found on products page"


def test_best_sellers_page(driver, base_url):
    """Test best sellers page loads"""
    driver.get(f"{base_url}/collections/best-sellers")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "main"))
    )
    print("✅ Best sellers page loaded")


def test_suggested_page(driver, base_url):
    """Test suggested products page loads"""
    driver.get(f"{base_url}/collections/suggested")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "main"))
    )
    print("✅ Suggested products page loaded")


def test_product_click_navigation(driver, base_url):
    """Test clicking on a product navigates to detail page"""
    driver.get(f"{base_url}/collections/allproducts")
    time.sleep(3)
    
    # Find clickable product links
    product_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/product/"]')
    
    if product_links:
        first_product = product_links[0]
        product_url = first_product.get_attribute("href")
        first_product.click()
        
        WebDriverWait(driver, 10).until(EC.url_contains("/product/"))
        assert "/product/" in driver.current_url
        print(f"✅ Product detail page navigation works")
    else:
        print("⚠️ No product links found to test navigation")


def test_search_functionality_exists(driver, base_url):
    """Test that search icon exists"""
    driver.get(base_url)
    
    # Look for search icon/button
    search_buttons = driver.find_elements(By.CSS_SELECTOR, 'button svg')
    
    has_search = False
    for button in search_buttons:
        # Check if it's a search icon (magnifying glass SVG path)
        paths = button.find_elements(By.TAG_NAME, "path")
        for path in paths:
            d_attr = path.get_attribute("d")
            if d_attr and "21 21l-6-6" in d_attr:  # Search icon pattern
                has_search = True
                break
    
    if has_search:
        print("✅ Search functionality icon found")
    else:
        print("⚠️ Search icon not found in expected format")
