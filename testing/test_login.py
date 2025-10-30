import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def open_signin(driver, base_url):
    driver.get(f"{base_url}/signin")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "email"))
    )

def fill_and_submit_login(driver, email, password):
    email_input = driver.find_element(By.ID, "email")
    password_input = driver.find_element(By.ID, "password")
    submit_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')

    email_input.clear()
    email_input.send_keys(email)
    password_input.clear()
    password_input.send_keys(password)
    submit_btn.click()

def clear_session(driver, base_url):
    driver.execute_script("localStorage.clear();")
    driver.get(base_url)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'a[href="/signin"]'))
    )

@pytest.mark.parametrize("mode", ["success"])
def test_login_success_multiple_times(driver, base_url, test_email, test_password, test_runs, mode):
    if not test_email or not test_password:
        pytest.skip("TEST_EMAIL and TEST_PASSWORD must be set for success login test.")

    for i in range(test_runs):
        print(f"\n🔄 Running login test iteration {i+1}/{test_runs}")
        open_signin(driver, base_url)
        fill_and_submit_login(driver, test_email, test_password)

        WebDriverWait(driver, 15).until(EC.url_to_be(f"{base_url}/"))

        signin_links = driver.find_elements(By.CSS_SELECTOR, 'a[href="/signin"]')
        assert len(signin_links) == 0, "Sign in link should be absent after login"

        tokens_present = driver.execute_script(
            "return !!localStorage.getItem('ecommerce_auth_tokens');"
        )
        assert tokens_present, "Auth tokens should be present after successful login"

        print(f"✅ Iteration {i+1}/{test_runs} passed")
        clear_session(driver, base_url)

def test_login_invalid_password_multiple_times(driver, base_url, test_email, test_runs):
    if not test_email:
        pytest.skip("TEST_EMAIL must be set for invalid password test.")

    wrong_password = "invalid_password_123!"

    for i in range(test_runs):
        print(f"\n🔄 Running invalid password test iteration {i+1}/{test_runs}")
        open_signin(driver, base_url)
        fill_and_submit_login(driver, test_email, wrong_password)

        error_banner = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(@class,'bg-red-100')]"))
        )
        assert error_banner is not None, "Error banner should appear on invalid login"
        print(f"✅ Iteration {i+1}/{test_runs} passed")
