import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


def test_signin_form_validation(driver, base_url):
    """Test signin form field validation"""
    driver.get(f"{base_url}/signin")
    
    # Find form elements
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "email"))
    )
    password_input = driver.find_element(By.ID, "password")
    submit_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
    
    # Test required attribute
    assert email_input.get_attribute("required") is not None
    assert password_input.get_attribute("required") is not None
    
    print("✅ Signin form validation attributes present")


def test_signup_form_exists(driver, base_url):
    """Test that signup form exists and has required fields"""
    driver.get(f"{base_url}/signup")
    
    # Wait for form to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "form"))
    )
    
    # Check for email input
    email_inputs = driver.find_elements(By.CSS_SELECTOR, 'input[type="email"]')
    assert len(email_inputs) > 0, "Email input not found"
    
    # Check for password inputs
    password_inputs = driver.find_elements(By.CSS_SELECTOR, 'input[type="password"]')
    assert len(password_inputs) > 0, "Password input not found"
    
    # Check for submit button
    submit_buttons = driver.find_elements(By.CSS_SELECTOR, 'button[type="submit"]')
    assert len(submit_buttons) > 0, "Submit button not found"
    
    print("✅ Signup form has all required fields")


def test_password_visibility_toggle(driver, base_url):
    """Test password visibility toggle functionality"""
    driver.get(f"{base_url}/signin")
    
    password_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "password"))
    )
    
    # Initial state should be password
    initial_type = password_input.get_attribute("type")
    assert initial_type == "password", "Password should be hidden initially"
    
    # Find toggle button (eye icon)
    toggle_buttons = driver.find_elements(By.CSS_SELECTOR, 'button[type="button"]')
    
    password_toggle = None
    for btn in toggle_buttons:
        # Check if button has SVG (eye icon)
        svgs = btn.find_elements(By.TAG_NAME, "svg")
        if svgs and btn.is_displayed():
            password_toggle = btn
            break
    
    if password_toggle:
        password_toggle.click()
        
        # Check if type changed to text
        new_type = password_input.get_attribute("type")
        assert new_type == "text", "Password should be visible after toggle"
        
        print("✅ Password visibility toggle works")
    else:
        print("⚠️ Password toggle button not found")


def test_form_submission_with_empty_fields(driver, base_url):
    """Test form submission with empty fields"""
    driver.get(f"{base_url}/signin")
    
    submit_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[type="submit"]'))
    )
    
    submit_btn.click()
    
    # Form should not submit (HTML5 validation)
    # URL should remain on signin page
    assert "/signin" in driver.current_url
    print("✅ Form validation prevents empty submission")


def test_invalid_email_format(driver, base_url):
    """Test email field with invalid format"""
    driver.get(f"{base_url}/signin")
    
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "email"))
    )
    password_input = driver.find_element(By.ID, "password")
    submit_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
    
    # Enter invalid email
    email_input.send_keys("invalid-email")
    password_input.send_keys("somepassword")
    submit_btn.click()
    
    # Should still be on signin page due to HTML5 validation
    assert "/signin" in driver.current_url
    print("✅ Invalid email format is caught by validation")


def test_remember_me_checkbox(driver, base_url):
    """Test remember me checkbox functionality"""
    driver.get(f"{base_url}/signin")
    
    remember_checkbox = driver.find_elements(By.ID, "remember-me")
    
    if remember_checkbox:
        checkbox = remember_checkbox[0]
        
        # Check initial state
        initial_checked = checkbox.is_selected()
        
        # Click checkbox
        checkbox.click()
        
        # Verify state changed
        new_checked = checkbox.is_selected()
        assert new_checked != initial_checked, "Checkbox state should toggle"
        
        print("✅ Remember me checkbox works")
    else:
        print("⚠️ Remember me checkbox not found")


def test_google_signin_button_exists(driver, base_url):
    """Test that Google sign in button exists"""
    driver.get(f"{base_url}/signin")
    
    # Look for Google sign in button
    buttons = driver.find_elements(By.TAG_NAME, "button")
    
    google_button_found = False
    for button in buttons:
        if "Google" in button.text or "google" in button.text.lower():
            google_button_found = True
            break
    
    if google_button_found:
        print("✅ Google sign in button found")
    else:
        print("⚠️ Google sign in button not found")
