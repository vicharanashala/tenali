import re

with open('client/src/App.jsx', 'r') as f:
    content = f.read()

# Replace `setAdaptScore(0.1); adaptScoreRef.current = 0.1` and `adaptScoreRef.current = 0.1`
# with a proper reload if possible, or just remove them.
# Wait, some apps have `apiPath` in scope, some have a hardcoded string.
# Let's just find the `loadBKTState(...)` call that initialized `adaptScoreRef` in the same component.
# Actually, if we just remove the 0.1 reset, it will use the current state, which is correct for continuing a quiz.
# The only issue is if they just took a diagnostic. To fix that, we can just replace the 0.1 reset lines
# with nothing!

# Let's see:
content = re.sub(r'setAdaptScore\(0\.1\);\s*adaptScoreRef\.current = 0\.1', '', content)
content = re.sub(r'setAdaptScore\(0\.1\)\n\s*adaptScoreRef\.current = 0\.1', '', content)
content = re.sub(r'adaptScoreRef\.current = 0\.1', '', content)

with open('client/src/App.jsx', 'w') as f:
    f.write(content)

print("Fixed BKT reset bug.")
