import re

with open('src/lib/DiagnosticQuiz.jsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = "import { getPromptForType } from './questionFormatters'\n"
if "getPromptForType" not in content:
    content = content.replace("import { getPrerequisites", import_stmt + "import { getPrerequisites")

# Replace rendering line
# {currentQ?.questionData?.prompt || currentQ?.questionData?.question || JSON.stringify(currentQ?.questionData)}
# With: {getPromptForType(currentQ?.prereqKey, currentQ?.questionData) || currentQ?.questionData?.prompt || currentQ?.questionData?.question || JSON.stringify(currentQ?.questionData)}

old_render = "{currentQ?.questionData?.prompt || currentQ?.questionData?.question || JSON.stringify(currentQ?.questionData)}"
new_render = "{getPromptForType(currentQ?.prereqKey, currentQ?.questionData) || currentQ?.questionData?.prompt || currentQ?.questionData?.question || JSON.stringify(currentQ?.questionData)}"

content = content.replace(old_render, new_render)

with open('src/lib/DiagnosticQuiz.jsx', 'w') as f:
    f.write(content)

print("Updated DiagnosticQuiz.jsx")
