import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# Remove all the bloated adaptScore injections
text = text.replace('adaptScore={typeof adaptScore !== "undefined" ? adaptScore : undefined} \n      ', '')
text = text.replace('adaptScore={typeof adaptScore !== "undefined" ? adaptScore : undefined}', '')

# Now, selectively inject adaptScore={adaptScore} ONLY if the component defines adaptScore.
# We will split the file into components using "function " or "const " (or just search for functions).
# Actually, it's easier to find `<QuizLayout` and check if "adaptScore" exists in the text before it within the same function.
# But regex can be tricky. Let's do it cleanly:
parts = re.split(r'(function [A-Z][a-zA-Z0-9_]*\([^)]*\)\s*\{)', text)

new_parts = []
for i in range(len(parts)):
    part = parts[i]
    if i % 2 == 0 and i > 0:
        # This is the body of a component (if parts[i-1] was a component signature)
        sig = parts[i-1]
        body = parts[i]
        
        # Check if this component defines adaptScore
        if 'const [adaptScore' in body or 'let adaptScore' in body or 'var adaptScore' in body:
            # Inject it into QuizLayout
            # It might look like <QuizLayout title=...
            body = re.sub(r'<QuizLayout\b(?!.*?adaptScore=)', r'<QuizLayout adaptScore={adaptScore} ', body)
        
        new_parts.append(sig + body)
    elif i == 0:
        new_parts.append(part)

final_text = "".join(new_parts)

with open('client/src/App.jsx', 'w') as f:
    f.write(final_text)

print("Cleaned up QuizLayout!")
