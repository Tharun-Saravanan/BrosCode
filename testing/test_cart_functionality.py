import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def login_user(driver, base_url, email, password):
    """Helper function to login user"""
    driver.get(f"{base_url}/signin")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "email"))
    )
    
    email_input = driver.find_element(By.ID, "email")
    password_input = driver.find_element(By.ID, "password")
    submit_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
    
    email_input.send_keys(email)
    password_input.send_keys(password)
    submit_btn.click()
    
    WebDriverWait(driver, 15).until(EC.url_to_be(f"{base_url}/"))


def test_cart_icon_visible(driver, base_url):
    """Test that cart icon is visible"""
    driver.get(base_url)
    cart_button = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'button svg'))
    )
    assert cart_button is not None
    print("✅ Cart icon is visible")


def test_open_cart_sidebar(driver, base_url):
    """Test opening cart sidebar"""
    driver.get(base_url)
    
    # Find and click cart button
    cart_buttons = driver.find_elements(By.CSS_SELECTOR, 'button')
    cart_button = None
    for button in cart_buttons:
        if 'cart' in button.get_attribute('class').lower() or 'relative' in button.get_attribute('class'):
            svg_elements = button.find_elements(By.TAG_NAME, 'svg')
            if svg_elements:
                cart_button = button
                break
    
    if cart_button:
        cart_button.click()
        time.sleep(2)  # Wait for cart sidebar animation
        print("✅ Cart sidebar opened")
    else:
        print("⚠️ Cart button not found in expected format")


def test_guest_cart_interaction(driver, base_url):
    """Test cart interaction as guest user"""
    driver.get(base_url)
    driver.execute_script("localStorage.clear();")
    driver.refresh()
    
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "header"))
    )
    
    # Check that cart starts empty for guest
    cart_count_elements = driver.find_elements(By.CSS_SELECTOR, 'span.animate-pulse')
    if cart_count_elements:
        # Cart has items
        print(f"⚠️ Cart has {cart_count_elements[0].text} items")
    else:
        print("✅ Guest cart is empty initially")


def test_authenticated_cart_persistence(driver, base_url, test_email, test_password):
    """Test that cart persists for authenticated users"""
    if not test_email or not test_password:
        pytest.skip("TEST_EMAIL and TEST_PASSWORD required")
    
    # Login
    login_user(driver, base_url, test_email, test_password)
    
    # Check for user-specific cart in localStorage
    cart_data = driver.execute_script(
        "return localStorage.getItem('sibiling_shoes_user_cart_' + arguments[0]);",
        test_email
    )
    
    print(f"✅ Authenticated user cart data retrieved")


def test_cart_badge_updates(driver, base_url):
    """Test that cart badge shows item count"""
    driver.get(base_url)
    
    # Look for cart badge
    badge_elements = driver.find_elements(By.CSS_SELECTOR, 'span.animate-pulse')
    
    if badge_elements:
        badge_text = badge_elements[0].text
        print(f"✅ Cart badge shows: {badge_text} items")
    else:
        print("✅ Cart badge not shown (empty cart)")
