def inspect_file(filename):
    print(f"Inspecting {filename}:")
    with open(filename, 'rb') as f:
        content = f.read()
    
    # Look for 'suicide' in bytes
    search_term = b'suicide'
    if search_term in content:
        idx = content.find(search_term)
        snippet = content[max(0, idx-10):min(len(content), idx+20)]
        print(f"Found 'suicide' at index {idx}. Context: {snippet}")
    else:
        print(f"'suicide' not found in bytes!")

inspect_file('crisis.py')
inspect_file('ai.py')
