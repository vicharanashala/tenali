import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# Remove MasteryDisplay imports and usage
text = re.sub(r'<MasteryDisplay[^>]*/>', '', text)

# Remove DifficultySlider usage
text = re.sub(r'<DifficultySlider[^>]*/>', '', text)

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Removed UI components.")
