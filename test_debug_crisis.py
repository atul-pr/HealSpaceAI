from crisis import detect_crisis
from ai import is_relevant_topic, get_ai_response

msg = "i want to suicide"
is_crisis, crisis_type = detect_crisis(msg)
is_relevant = is_relevant_topic(msg)

print(f"Message: {msg}")
print(f"Is Crisis: {is_crisis}, Type: {crisis_type}")
print(f"Is Relevant: {is_relevant}")

response = get_ai_response(msg)
print(f"AI Response: {response}")
