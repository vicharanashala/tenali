import re

with open('src/App.jsx', 'r') as f:
    app_content = f.read()

# Find getPromptForType function
match = re.search(r'function getPromptForType\(type,\s*q\)\s*\{.*?\n\s*\}', app_content, re.DOTALL)
if match:
    func_text = match.group(0)
    
    # Export it
    func_text_export = func_text.replace('function getPromptForType', 'export function getPromptForType')
    
    with open('src/lib/questionFormatters.js', 'w') as f:
        f.write(func_text_export)
        
    # Remove from App.jsx and add import
    new_app = app_content[:match.start()] + app_content[match.end():]
    new_app = "import { getPromptForType } from './lib/questionFormatters';\n" + new_app
    
    with open('src/App.jsx', 'w') as f:
        f.write(new_app)
        
    print("Successfully extracted getPromptForType!")
else:
    print("Could not find getPromptForType!")
