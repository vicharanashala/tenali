import re

with open('tenalifun_bundle.js', 'r') as f:
    text = f.read()

# Look for fetch calls or endpoints
matches = re.finditer(r'fetch\([\'"`]([^\'"`]*fraction[^\'"`]*)', text)
for i, m in enumerate(matches):
    print(f"Match {i}: {m.group(1)}")

matches2 = re.finditer(r'axios\.[a-z]+\([\'"`]([^\'"`]*fraction[^\'"`]*)', text)
for i, m in enumerate(matches2):
    print(f"Axios {i}: {m.group(1)}")

# Just search for "/fraction" string literal
matches3 = re.finditer(r'[\'"`]/fraction[^\'"`]*[\'"`]', text)
for i, m in enumerate(matches3):
    print(f"Literal {i}: {m.group(0)}")

