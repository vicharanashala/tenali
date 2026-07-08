import re
import json

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

mapping = {}
# Find modeMap definition
match = re.search(r'const modeMap = \{([^}]+)\}', text)
if match:
    block = match.group(1)
    for line in block.split('\n'):
        if ':' in line and 'App' in line:
            parts = line.split(':')
            key = parts[0].strip()
            val = parts[1].split(',')[0].strip()
            if val.endswith('App'):
                mapping[val] = key

print(json.dumps(mapping, indent=2))
