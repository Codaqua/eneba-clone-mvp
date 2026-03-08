import requests

BACKEND_URL = "http://127.0.0.1:8000"

# 1. Login to get token
# Note: Using 'yo@gmail.com' because that was found in the DB. 
# Password is assumed to be what the user set during register.
try:
    login_data = {
        "username": "yo@gmail.com",
        "password": "yo" 
    }
    print(f"Logging in as {login_data['username']}...")
    login_res = requests.post(f"{BACKEND_URL}/auth/login", data=login_data)
    
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.status_code} - {login_res.text}")
    else:
        token = login_res.json()["access_token"]
        print("Login successful.")

        # 2. Try creating a product
        headers = {"Authorization": f"Bearer {token}"}
        product_data = {
            "title": "Verifying Game",
            "description": "Just a test game",
            "price": 49.99,
            "discount": 0.0,
            "image_url": "https://placehold.co/400x500",
            "platform": "PC",
            "stock": 10
        }
        print("Creating product...")
        prod_res = requests.post(f"{BACKEND_URL}/products", json=product_data, headers=headers)
        
        if prod_res.status_code == 200:
            print("Product created successfully!")
        else:
            print(f"Product creation failed: {prod_res.status_code} - {prod_res.text}")

except Exception as e:
    print(f"Error during verification: {e}")
