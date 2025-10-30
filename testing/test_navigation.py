import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_homepage_loads(driver, base_url):
    """Test that homepage loads successfully"""
    driver.get(base_url)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "header"))
    )
    assert "Quick Snack" in driver.page_source
    print("✅ Homepage loaded successfully")


def test_navigation_links(driver, base_url):
    """Test all main navigation links"""
    driver.get(base_url)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "nav"))
    )
    
    # Test "Suggested For You" link
    suggested_link = driver.find_element(By.CSS_SELECTOR, 'a[href="/collections/suggested"]')
    suggested_link.click()
    WebDriverWait(driver, 10).until(EC.url_contains("/collections/suggested"))
    assert "/collections/suggested" in driver.current_url
    print("✅ Suggested For You navigation works")
    
    # Test "Best Sellers" link
    driver.get(base_url)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "nav")))
    best_sellers_link = driver.find_element(By.CSS_SELECTOR, 'a[href="/collections/best-sellers"]')
    best_sellers_link.click()
    WebDriverWait(driver, 10).until(EC.url_contains("/collections/best-sellers"))
    assert "/collections/best-sellers" in driver.current_url
    print("✅ Best Sellers navigation works")
    
    # Test "All Products" link
    driver.get(base_url)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "nav")))
    all_products_link = driver.find_element(By.CSS_SELECTOR, 'a[href="/collections/allproducts"]')
    all_products_link.click()
    WebDriverWait(driver, 10).until(EC.url_contains("/collections/allproducts"))
    assert "/collections/allproducts" in driver.current_url
    print("✅ All Products navigation works")


def test_footer_exists(driver, base_url):
    """Test that footer is present"""
    driver.get(base_url)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "footer"))
    )
    print("✅ Footer is present")


def test_signin_signup_links(driver, base_url):
    """Test sign in and sign up navigation"""
    driver.get(base_url)
    
    # Click sign in link
    signin_link = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="/signin"]'))
    )
    signin_link.click()
    WebDriverWait(driver, 10).until(EC.url_to_be(f"{base_url}/signin"))
    assert driver.current_url == f"{base_url}/signin"
    print("✅ Sign in navigation works")
    
    # Click sign up link from sign in page
    signup_link = driver.find_element(By.CSS_SELECTOR, 'a[href="/signup"]')
    signup_link.click()
    WebDriverWait(driver, 10).until(EC.url_to_be(f"{base_url}/signup"))
    assert driver.current_url == f"{base_url}/signup"
    print("✅ Sign up navigation works")
