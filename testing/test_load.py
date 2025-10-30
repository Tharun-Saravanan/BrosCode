import pytest
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


def create_driver():
    """Create a new WebDriver instance"""
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1280,800")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)


def load_page(base_url, page_name):
    """Load a page and measure response time"""
    driver = create_driver()
    start_time = time.time()
    
    try:
        driver.get(base_url + page_name)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        load_time = time.time() - start_time
        success = True
        error = None
    except Exception as e:
        load_time = time.time() - start_time
        success = False
        error = str(e)
    finally:
        driver.quit()
    
    return {
        'page': page_name,
        'success': success,
        'load_time': load_time,
        'error': error
    }


def test_concurrent_homepage_load(base_url):
    """Test loading homepage with concurrent users"""
    concurrent_users = 5
    results = []
    
    print(f"\n🔄 Testing with {concurrent_users} concurrent users...")
    
    with ThreadPoolExecutor(max_workers=concurrent_users) as executor:
        futures = [executor.submit(load_page, base_url, "/") for _ in range(concurrent_users)]
        
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            status = "✅" if result['success'] else "❌"
            print(f"{status} User load time: {result['load_time']:.2f}s")
    
    successful_loads = sum(1 for r in results if r['success'])
    avg_load_time = sum(r['load_time'] for r in results) / len(results)
    
    print(f"\n📊 Results:")
    print(f"   Successful loads: {successful_loads}/{concurrent_users}")
    print(f"   Average load time: {avg_load_time:.2f}s")
    print(f"   Success rate: {(successful_loads/concurrent_users)*100:.1f}%")
    
    assert successful_loads >= concurrent_users * 0.8, "Less than 80% success rate"


def test_sequential_page_loads(base_url):
    """Test loading different pages sequentially"""
    pages = [
        "/",
        "/collections/allproducts",
        "/collections/best-sellers",
        "/collections/suggested",
        "/signin",
        "/signup"
    ]
    
    results = []
    print(f"\n🔄 Testing sequential page loads...")
    
    for page in pages:
        result = load_page(base_url, page)
        results.append(result)
        status = "✅" if result['success'] else "❌"
        print(f"{status} {page}: {result['load_time']:.2f}s")
    
    successful_loads = sum(1 for r in results if r['success'])
    avg_load_time = sum(r['load_time'] for r in results) / len(results)
    
    print(f"\n📊 Results:")
    print(f"   Successful loads: {successful_loads}/{len(pages)}")
    print(f"   Average load time: {avg_load_time:.2f}s")
    
    assert successful_loads == len(pages), f"Some pages failed to load"


def test_rapid_page_navigation(driver, base_url):
    """Test rapid navigation between pages"""
    pages = [
        "/",
        "/collections/allproducts",
        "/collections/best-sellers",
        "/signin"
    ]
    
    print(f"\n🔄 Testing rapid navigation...")
    
    for i in range(3):  # Navigate through pages 3 times
        for page in pages:
            start_time = time.time()
            driver.get(base_url + page)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            load_time = time.time() - start_time
            print(f"   Round {i+1} - {page}: {load_time:.2f}s")
    
    print("✅ Rapid navigation test completed")


def test_stress_signin_page(base_url):
    """Stress test the signin page with multiple concurrent requests"""
    concurrent_requests = 10
    results = []
    
    print(f"\n🔄 Stress testing signin page with {concurrent_requests} requests...")
    
    with ThreadPoolExecutor(max_workers=concurrent_requests) as executor:
        futures = [executor.submit(load_page, base_url, "/signin") for _ in range(concurrent_requests)]
        
        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            results.append(result)
            status = "✅" if result['success'] else "❌"
            print(f"{status} Request {i}: {result['load_time']:.2f}s")
    
    successful_loads = sum(1 for r in results if r['success'])
    avg_load_time = sum(r['load_time'] for r in results) / len(results)
    max_load_time = max(r['load_time'] for r in results)
    min_load_time = min(r['load_time'] for r in results)
    
    print(f"\n📊 Stress Test Results:")
    print(f"   Total requests: {concurrent_requests}")
    print(f"   Successful: {successful_loads}")
    print(f"   Failed: {concurrent_requests - successful_loads}")
    print(f"   Average load time: {avg_load_time:.2f}s")
    print(f"   Min load time: {min_load_time:.2f}s")
    print(f"   Max load time: {max_load_time:.2f}s")
    
    assert successful_loads >= concurrent_requests * 0.9, "Less than 90% success rate under stress"


@pytest.mark.slow
def test_endurance_homepage(driver, base_url):
    """Test homepage endurance by loading it repeatedly"""
    iterations = 20
    load_times = []
    
    print(f"\n🔄 Endurance test: Loading homepage {iterations} times...")
    
    for i in range(iterations):
        start_time = time.time()
        driver.get(base_url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "header"))
        )
        load_time = time.time() - start_time
        load_times.append(load_time)
        
        if (i + 1) % 5 == 0:
            print(f"   Completed {i + 1}/{iterations} iterations")
    
    avg_load_time = sum(load_times) / len(load_times)
    print(f"\n📊 Endurance Test Results:")
    print(f"   Total iterations: {iterations}")
    print(f"   Average load time: {avg_load_time:.2f}s")
    print(f"   Min load time: {min(load_times):.2f}s")
    print(f"   Max load time: {max(load_times):.2f}s")
    
    print("✅ Endurance test completed")
