import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# Match component signature: function SomethingApp({ onBack }) {
# and replace with: function SomethingApp({ onBack, initialAdaptScore }) {
def sig_replacer(match):
    full_match = match.group(0)
    if 'initialAdaptScore' not in full_match:
        return full_match.replace('{ onBack }', '{ onBack, initialAdaptScore }').replace('{onBack}', '{ onBack, initialAdaptScore }')
    return full_match

text = re.sub(r'function [A-Za-z0-9_]+App\(\{\s*onBack\s*\}\)\s*\{', sig_replacer, text)

# Match useState(false) for isAdaptive and useState(0.1) for adaptScore
# const [isAdaptive, setIsAdaptive] = useState(false)
text = re.sub(
    r'(const \[isAdaptive, setIsAdaptive\] = useState\()false(\))',
    r'\1initialAdaptScore > 0.1\2',
    text
)

# const [adaptScore, setAdaptScore] = useState(0.1)
text = re.sub(
    r'(const \[adaptScore, setAdaptScore\] = useState\()0\.1(\))',
    r'\1initialAdaptScore ?? 0.1\2',
    text
)

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Applied smart adaptive initializers!")
