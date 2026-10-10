import jwt
import datetime
import urllib.request
import urllib.error
import json

secret = "vErYsEcReTkEyThAtIsAtLeAsT32ByTeSlOnGfOrHs256"

def create_token(roles=None):
    payload = {
        "sub": "123e4567-e89b-12d3-a456-426614174000",
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    if roles:
        payload["roles"] = roles
    return jwt.encode(payload, secret, algorithm="HS256")

customer_token = create_token("CUSTOMER")
admin_token = create_token("ADMIN")
norole_token = create_token()
tampered_token = customer_token[:-5] + "aaaaa"

def do_request(url, method="GET", token=None, extra_headers=None, data=None):
    req = urllib.request.Request(url, method=method)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    if extra_headers:
        for k, v in extra_headers.items():
            req.add_header(k, v)
    if data:
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(data).encode("utf-8")
        
    try:
        resp = urllib.request.urlopen(req)
        return resp.getcode()
    except urllib.error.HTTPError as e:
        return e.code
    except urllib.error.URLError as e:
        return f"ERROR: {e.reason}"

# Product API endpoints
products_url = "http://localhost:80/api/v1/products"
cart_url = "http://localhost:80/api/v1/cart" # Assumed cart endpoint

print("1. Missing JWT on protected endpoint:", do_request(products_url, method="POST", data={}))
print("2. Tampered JWT on protected endpoint:", do_request(products_url, method="POST", token=tampered_token, data={}))
print("3. Validly signed token without roles claim:", do_request(products_url, method="POST", token=norole_token, data={}))
print("4. Valid CUSTOMER JWT against ADMIN-only endpoint:", do_request(products_url, method="POST", token=customer_token, data={}))
print("5. Valid CUSTOMER JWT plus X-User-Role: ADMIN against ADMIN-only endpoint:", do_request(products_url, method="POST", token=customer_token, extra_headers={"X-User-Role": "ADMIN"}, data={}))
print("6. Valid ADMIN JWT against ADMIN-only endpoint:", do_request(products_url, method="POST", token=admin_token, data={"name":"Test","price":10,"description":"Test","sku":"TEST"}))
print("7. Customer product GET:", do_request(products_url, method="GET", token=customer_token))
print("8. Authenticated cart operation:", do_request(cart_url, method="GET", token=customer_token))
