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
from datetime import datetime


def create_driver():
    """Create a new WebDriver instance"""
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1280,800")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)


def simulate_user_session(user_id, base_url):
    """Simulate a complete user session"""
    driver = None
    start_time = time.time()
    
    try:
        driver = create_driver()
        
        # Visit homepage
        driver.get(base_url)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Browse products
        driver.get(f"{base_url}/collections/allproducts")
        time.sleep(0.5)
        
        # Visit best sellers
        driver.get(f"{base_url}/collections/best-sellers")
        time.sleep(0.5)
        
        load_time = time.time() - start_time
        
        return {
            'user_id': user_id,
            'success': True,
            'load_time': load_time,
            'error': None,
            'timestamp': datetime.now().strftime('%H:%M:%S.%f')[:-3]
        }
        
    except Exception as e:
        load_time = time.time() - start_time
        return {
            'user_id': user_id,
            'success': False,
            'load_time': load_time,
            'error': str(e)[:100],
            'timestamp': datetime.now().strftime('%H:%M:%S.%f')[:-3]
        }
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass


def test_load_1000_concurrent_users(base_url):
    """Load test with 1000 concurrent users"""
    total_users = 1000
    max_workers = 50  # Concurrent browser instances
    
    print(f"\n{'='*80}")
    print(f"🚀 LOAD TEST: {total_users} CONCURRENT USERS")
    print(f"{'='*80}")
    print(f"Target URL: {base_url}")
    print(f"Max Workers: {max_workers}")
    print(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}\n")
    
    results = []
    completed = 0
    start_time = time.time()
    
    # Progress tracking
    milestones = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all user sessions
        futures = [
            executor.submit(simulate_user_session, i, base_url) 
            for i in range(1, total_users + 1)
        ]
        
        # Collect results as they complete
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            completed += 1
            
            # Show progress at milestones
            if completed in milestones:
                elapsed = time.time() - start_time
                success_count = sum(1 for r in results if r['success'])
                success_rate = (success_count / completed) * 100
                avg_time = sum(r['load_time'] for r in results) / len(results)
                
                print(f"[{result['timestamp']}] Progress: {completed}/{total_users} users | "
                      f"Success: {success_rate:.1f}% | "
                      f"Avg Time: {avg_time:.2f}s | "
                      f"Elapsed: {elapsed:.1f}s")
    
    total_time = time.time() - start_time
    
    # Calculate statistics
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    success_count = len(successful)
    failure_count = len(failed)
    success_rate = (success_count / total_users) * 100
    
    if successful:
        avg_load_time = sum(r['load_time'] for r in successful) / len(successful)
        min_load_time = min(r['load_time'] for r in successful)
        max_load_time = max(r['load_time'] for r in successful)
        
        # Calculate percentiles
        sorted_times = sorted(r['load_time'] for r in successful)
        p50 = sorted_times[len(sorted_times) // 2]
        p95 = sorted_times[int(len(sorted_times) * 0.95)]
        p99 = sorted_times[int(len(sorted_times) * 0.99)]
    else:
        avg_load_time = min_load_time = max_load_time = p50 = p95 = p99 = 0
    
    throughput = total_users / total_time
    
    # Print detailed report
    print(f"\n{'='*80}")
    print(f"📊 LOAD TEST RESULTS")
    print(f"{'='*80}")
    print(f"\n🎯 Test Configuration:")
    print(f"   Total Users Simulated: {total_users}")
    print(f"   Max Concurrent Workers: {max_workers}")
    print(f"   Total Test Duration: {total_time:.2f}s ({total_time/60:.2f} minutes)")
    print(f"   Throughput: {throughput:.2f} users/second")
    
    print(f"\n✅ Success Metrics:")
    print(f"   Successful Requests: {success_count}/{total_users}")
    print(f"   Failed Requests: {failure_count}/{total_users}")
    print(f"   Success Rate: {success_rate:.2f}%")
    
    if successful:
        print(f"\n⏱️  Response Time Statistics:")
        print(f"   Average: {avg_load_time:.2f}s")
        print(f"   Minimum: {min_load_time:.2f}s")
        print(f"   Maximum: {max_load_time:.2f}s")
        print(f"   50th Percentile (P50): {p50:.2f}s")
        print(f"   95th Percentile (P95): {p95:.2f}s")
        print(f"   99th Percentile (P99): {p99:.2f}s")
    
    if failed:
        print(f"\n❌ Error Analysis:")
        error_types = {}
        for r in failed:
            error_key = r['error'][:50] if r['error'] else 'Unknown'
            error_types[error_key] = error_types.get(error_key, 0) + 1
        
        print(f"   Top Errors:")
        for error, count in sorted(error_types.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"   - {error}: {count} occurrences")
    
    print(f"\n🎯 Performance Assessment:")
    if success_rate >= 95:
        print(f"   ✅ EXCELLENT - System handled load very well!")
    elif success_rate >= 90:
        print(f"   ✅ GOOD - System performed well under load")
    elif success_rate >= 80:
        print(f"   ⚠️  ACCEPTABLE - Some issues under heavy load")
    elif success_rate >= 70:
        print(f"   ⚠️  POOR - Significant issues under load")
    else:
        print(f"   ❌ CRITICAL - System struggled with load")
    
    if avg_load_time < 3:
        print(f"   ✅ Response times are excellent")
    elif avg_load_time < 5:
        print(f"   ✅ Response times are good")
    elif avg_load_time < 10:
        print(f"   ⚠️  Response times are acceptable")
    else:
        print(f"   ❌ Response times need improvement")
    
    print(f"\n{'='*80}")
    print(f"End Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}\n")
    
    # Assert success criteria
    assert success_rate >= 70, f"Success rate {success_rate:.2f}% is below 70% threshold"
    assert avg_load_time < 30, f"Average load time {avg_load_time:.2f}s exceeds 30s threshold"
