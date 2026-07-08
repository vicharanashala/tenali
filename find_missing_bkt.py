import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

apps = re.findall(r'function (\w+App)\(', text)
apps = list(set(apps))
missing = []

for app in apps:
    # Extract the function body roughly
    match = re.search(f'function {app}[^{{]*{{(.*?)function \w+App', text, re.DOTALL)
    if match:
        body = match.group(1)
        if 'adaptScore' not in body:
            missing.append(app)
    else:
        # Check end of file
        match = re.search(f'function {app}[^{{]*{{(.*)', text, re.DOTALL)
        if match:
            body = match.group(1)
            if 'adaptScore' not in body:
                missing.append(app)

print(f"Total apps: {len(apps)}")
print(f"Missing adaptScore: {len(missing)}")
print(missing)
