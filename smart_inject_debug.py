import re

with open('client/src/App.jsx', 'r') as f:
    lines = f.readlines()

in_app = False
app_name = ""
has_adaptscore = False
has_h1 = False

for i, line in enumerate(lines):
    match = re.search(r'function\s+([A-Za-z0-9_]+App)\(', line)
    if match:
        if in_app:
            print(f"App: {app_name}, has_adaptscore: {has_adaptscore}, has_h1: {has_h1}")
        in_app = True
        app_name = match.group(1)
        has_adaptscore = False
        has_h1 = False
    
    if in_app and 'adaptScore' in line:
        has_adaptscore = True
        
    if in_app and '<h1' in line:
        has_h1 = True

if in_app:
    print(f"App: {app_name}, has_adaptscore: {has_adaptscore}, has_h1: {has_h1}")

