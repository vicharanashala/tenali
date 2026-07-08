import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# Fix 1: Add const apiPath = 'fractionadd-api'
if "function FractionAddApp({ onBack }) {\n  const apiPath = 'fractionadd-api'" not in text:
    text = text.replace(
        "function FractionAddApp({ onBack }) {\n",
        "function FractionAddApp({ onBack }) {\n  const apiPath = 'fractionadd-api'\n"
    )

# Fix 2: Rename Fractions (Add) back to Fractions
text = text.replace("'Fractions (Add)'", "'Fractions'")

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Fixed FractionAddApp issues!")
