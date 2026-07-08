import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

pattern = re.compile(r'(function (?:[A-Z][a-zA-Z0-9]+|make[a-zA-Z]+)App\b(?:(?!\bfunction \b).)*?adaptScore(?:(?!\bfunction \b).)*?)(<h1)', re.DOTALL)

matches = pattern.findall(text)
print(f"Found {len(matches)} matches.")
if len(matches) > 0:
    print(matches[0][0][:100])
