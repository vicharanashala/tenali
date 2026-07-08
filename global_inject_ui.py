import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# Replace <h1 ...> with {typeof adaptScore ...} <h1 ...>
text = re.sub(
    r'(\n\s*)(<h1[^>]*>)',
    r'\1{typeof adaptScore !== "undefined" && <MasteryProgress adaptScore={adaptScore} />}\1\2',
    text
)

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Globally injected MasteryProgress!")
