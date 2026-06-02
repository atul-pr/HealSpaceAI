from crisis import detect_crisis

test_cases = [
    "I want to suicide",           # Should be True
    "I want to not suicide",       # Should be False (Negative intent)
    "I don't want to live",        # Should be True (Actual crisis)
    "I don't want to suicide",     # Debatable, but often used to test filters
    "I promise not to suicide"     # Should be False (Safety promise)
]

print("Running Crisis Detection Tests:")
print("-" * 30)
for msg in test_cases:
    is_crisis, crisis_type = detect_crisis(msg)
    print(f"Message: '{msg}'")
    print(f"Result: is_crisis={is_crisis}, type={crisis_type}")
    print("-" * 30)
