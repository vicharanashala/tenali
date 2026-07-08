with open('client/src/App.jsx', 'r') as f:
    text = f.read()

import re
match = re.search(r'function Home.*?return \(', text, re.DOTALL)
if match:
    print("Found Home return")
    # let's just print the 30 lines after the return
    start_idx = match.end()
    print(text[start_idx:start_idx+1500])
else:
    print("Could not find Home")
