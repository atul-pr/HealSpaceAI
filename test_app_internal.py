from app import app
import json

client = app.test_client()
msg = "i want to suicide"
print(f"Testing message: {msg}")

response = client.post('/chat', 
                      data=json.dumps({'message': msg}),
                      content_type='application/json')

print(f"Status: {response.status_code}")
data = json.loads(response.data)
print(f"Crisis: {data.get('crisis')}")
print(f"Response: {data.get('response')[:100]}...")

with open('chat_debug.log', 'r') as f:
    print("\nLog content:")
    print(f.read())
