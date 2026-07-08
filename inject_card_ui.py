import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

def replacer(match):
    prefix = match.group(1) # Up to <div className="card">
    card = match.group(2)   # <div className="card">
    
    # Check if we already injected
    if "<MasteryProgress" in prefix:
        return match.group(0)
        
    last_nl = prefix.rfind('\n')
    indent = prefix[last_nl+1:] if last_nl != -1 else ""
    return prefix + card + f"\n{indent}  <MasteryProgress adaptScore={{adaptScore}} />"

# Find adaptScore ... <div className="card">
# Without crossing function boundaries
pattern = re.compile(r'(function (?:[A-Z][a-zA-Z0-9]+|make[a-zA-Z]+)App\b(?:(?!\bfunction \b).)*?adaptScore(?:(?!\bfunction \b).)*?)(<div className="card">)', re.DOTALL)

new_text = pattern.sub(replacer, text)

with open('client/src/App.jsx', 'w') as f:
    f.write(new_text)

print(f"Injected into {len(pattern.findall(text))} apps!")
