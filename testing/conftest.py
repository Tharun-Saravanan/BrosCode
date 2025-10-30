import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

@pytest.fixture(scope="session")
def base_url():
    return os.getenv("APP_BASE_URL", "http://localhost:5173")

@pytest.fixture(scope="session")
def test_email():
    return os.getenv("TEST_EMAIL")

@pytest.fixture(scope="session")
def test_password():
    return os.getenv("TEST_PASSWORD")

@pytest.fixture(scope="session")
def test_runs():
    try:
        return int(os.getenv("TEST_RUNS", "3"))
    except ValueError:
        return 3

@pytest.fixture(scope="function")
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1280,800")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    yield driver
    driver.quit()
