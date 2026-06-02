import re

pattern = r'suicide.*mission'
msg = "i want to suicide"
print(f"Match: {bool(re.search(pattern, msg))}")
