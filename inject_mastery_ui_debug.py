import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

apps = re.split(r'\nfunction (?:make[A-Za-z]+App|[A-Z][a-zA-Z0-9]+App)\(', text)
print(f"Total apps split: {len(apps)}")
for i, app in enumerate(apps[1:]):
    if 'adaptScore' in app:
        print(f"App {i} has adaptScore")
        if re.search(r'\n(\s*)<h1', app):
            print(f"  App {i} has h1")
        else:
            print(f"  App {i} MISSING h1")
