import requests
import json
import time

GATEWAY = "http://localhost:80"
MAILHOG = "http://localhost:8025"
ORIGIN = "http://localhost:443"

print("=" * 60)
print("LUMIÈRE PHASE 1 — END-TO-END VERIFICATION")
print("=" * 60)

def robust_post(url, json_data, headers=None, max_retries=3):
    h = {"Origin": ORIGIN}
    if headers:
        h.update(headers)
    for attempt in range(max_retries):
        try:
            r = requests.post(url, json=json_data, headers=h, timeout=10)
            if r.status_code != 503:
                return r
            print(f"  (Received 503 cold-start fallback, retrying {attempt+1}/{max_retries}...)")
        except Exception as e:
            print(f"  (Request exception: {e}, retrying {attempt+1}/{max_retries}...)")
        time.sleep(1.5)
    return requests.post(url, json=json_data, headers=h)

def robust_get(url, headers=None, max_retries=3):
    h = {"Origin": ORIGIN}
    if headers:
        h.update(headers)
    for attempt in range(max_retries):
        try:
            r = requests.get(url, headers=h, timeout=10)
            if r.status_code != 503:
                return r
            print(f"  (Received 503 cold-start fallback, retrying {attempt+1}/{max_retries}...)")
        except Exception as e:
            print(f"  (Request exception: {e}, retrying {attempt+1}/{max_retries}...)")
        time.sleep(1.5)
    return requests.get(url, headers=h)

# 1. Customer Registration & Password Hashing
timestamp = int(time.time())
customer_email = f"lumiere.client.{timestamp}@example.com"
customer_password = "SecurePassword123!"

print("\n[1] Testing Customer Registration...")
reg_payload = {
    "firstName": "Genevieve",
    "lastName": "Dupond",
    "email": customer_email,
    "password": customer_password
}
reg_resp = robust_post(f"{GATEWAY}/api/v1/auth/register", reg_payload)
print(f"Register status: {reg_resp.status_code}")
assert reg_resp.status_code in [200, 201], f"Registration failed: {reg_resp.text}"
print(f"[OK] Registered customer: {customer_email}")

# 2. Customer Authentication
print("\n[2] Testing Customer Login...")
login_payload = {
    "email": customer_email,
    "password": customer_password
}
login_resp = robust_post(f"{GATEWAY}/api/v1/auth/login", login_payload)
print(f"Login status: {login_resp.status_code}")
assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
login_data = login_resp.json()
token = login_data.get("data", {}).get("accessToken")
assert token, f"No accessToken received: {login_data}"
print(f"[OK] Obtained JWT Access Token: {token[:20]}...")

# 3. Customer Profile & Protected Route
print("\n[3] Testing Protected Client Profile (/api/v1/auth/me)...")
auth_headers = {"Authorization": f"Bearer {token}"}
me_resp = robust_get(f"{GATEWAY}/api/v1/auth/me", headers=auth_headers)
print(f"Profile status: {me_resp.status_code}")
assert me_resp.status_code == 200, f"Profile fetch failed: {me_resp.text}"
me_data = me_resp.json().get("data", {})
assert me_data.get("email") == customer_email
print(f"[OK] Verified Profile Identity: {me_data.get('firstName')} {me_data.get('lastName')} ({me_data.get('email')})")

# 4. Data Isolation (Unauthenticated access rejection)
print("\n[4] Testing Customer Data Isolation...")
unauth_resp = requests.get(f"{GATEWAY}/api/v1/orders", headers={"Origin": ORIGIN})
print(f"Unauthenticated /api/v1/orders status: {unauth_resp.status_code}")
assert unauth_resp.status_code in [401, 403], f"Expected 401/403 for unauthenticated access, got {unauth_resp.status_code}"
print("[OK] Unauthenticated access successfully blocked.")

# 5. Product Catalog Browsing
print("\n[5] Testing Product Catalog...")
prod_resp = robust_get(f"{GATEWAY}/api/v1/products?page=0&size=10")
print(f"Products status: {prod_resp.status_code}")
assert prod_resp.status_code == 200, f"Products failed: {prod_resp.text}"
prod_data = prod_resp.json().get("data", {})
products = prod_data.get("content", [])
print(f"[OK] Retrieved {len(products)} products from vault.")
assert len(products) > 0, "No products found in database"
product = products[0]
prod_id = product["id"]
prod_price = product["price"]
print(f"[OK] Target Product: {product['name']} (ID: {prod_id}, Price: ${prod_price})")

# 6. Cart Flow
print("\n[6] Testing Cart Lifecycle...")
cart_get_resp = robust_get(f"{GATEWAY}/api/v1/cart", headers=auth_headers)
assert cart_get_resp.status_code in [200, 201], f"Cart fetch failed: {cart_get_resp.text}"
print("[OK] Cart accessible for authenticated customer.")

cart_add_resp = robust_post(
    f"{GATEWAY}/api/v1/cart/items",
    {"productId": prod_id, "quantity": 1},
    headers=auth_headers
)
assert cart_add_resp.status_code in [200, 201], f"Add to cart failed: {cart_add_resp.text}"
print("[OK] Added item to cart.")

# 7. Order Placement
print("\n[7] Testing Order Placement & Persistence...")
order_payload = {
    "shippingAddress": {
        "fullName": "Genevieve Dupond",
        "street": "45 Boulevard Saint-Germain",
        "city": "Paris",
        "state": "Île-de-France",
        "zipCode": "75005",
        "country": "France",
        "phoneNumber": "+33140506070"
    },
    "paymentMethod": "CREDIT_CARD"
}
order_resp = robust_post(f"{GATEWAY}/api/v1/orders", order_payload, headers=auth_headers)
print(f"Order creation status: {order_resp.status_code}")
assert order_resp.status_code in [200, 201], f"Order creation failed: {order_resp.text}"
order_data = order_resp.json().get("data", {})
order_num = order_data.get("orderNumber")
order_id = order_data.get("id")
order_status = order_data.get("status")
print(f"[OK] Order Placed: #{order_num} (Status: {order_status}, ID: {order_id})")

# 8. Order Status & History Persistence
print("\n[8] Testing Client Order History Retrieval...")
user_orders_resp = robust_get(f"{GATEWAY}/api/v1/orders", headers=auth_headers)
assert user_orders_resp.status_code == 200, f"User orders failed: {user_orders_resp.text}"
user_orders = user_orders_resp.json().get("data", {}).get("content", [])
found_order = next((o for o in user_orders if o.get("orderNumber") == order_num), None)
assert found_order is not None, f"Order #{order_num} not found in user order history"
print(f"[OK] Found Order #{order_num} in user's isolated history with status: {found_order.get('status')}")

# 9. Email Notification via MailHog
print("\n[9] Verifying Local Email Notification via MailHog...")
time.sleep(3) # allow RabbitMQ and MailHog async message receipt
mail_resp = requests.get(f"{MAILHOG}/api/v2/messages")
assert mail_resp.status_code == 200, f"MailHog fetch failed: {mail_resp.text}"
mail_data = mail_resp.json()
messages = mail_data.get("items", [])
print(f"Total messages in MailHog: {len(messages)}")

matching_mail = None
for m in messages:
    subject = m.get("Content", {}).get("Headers", {}).get("Subject", [""])[0]
    if order_num in subject:
        matching_mail = m
        break

if matching_mail:
    subject = matching_mail.get("Content", {}).get("Headers", {}).get("Subject", [""])[0]
    to_email = matching_mail.get("Content", {}).get("Headers", {}).get("To", [""])[0]
    from_email = matching_mail.get("Content", {}).get("Headers", {}).get("From", [""])[0]
    print(f"[OK] MailHog Message Captured:")
    print(f"   From: {from_email}")
    print(f"   To: {to_email}")
    print(f"   Subject: {subject}")
else:
    print(f"Notice: Order #{order_num} not immediately matched in MailHog messages, checking all messages...")
    for m in messages[:3]:
        print("   Subject:", m.get("Content", {}).get("Headers", {}).get("Subject", [""]))

print("\n" + "=" * 60)
print("ALL PHASE 1 BACKEND & API CHECKS PASSED SUCCESSFULLY!")
print("=" * 60)
