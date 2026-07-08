import re

with open('client/src/App.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
in_app = False
has_adaptscore = False
injected_count = 0

for i, line in enumerate(lines):
    # Detect start of a component function
    if re.search(r'function\s+[A-Za-z0-9_]+App\(', line):
        in_app = True
        has_adaptscore = False
    
    if in_app and 'adaptScore' in line:
        has_adaptscore = True
        
    if in_app and has_adaptscore and '<h1' in line:
        indent = re.match(r'^(\s*)', line).group(1)
        new_lines.append(indent + '<MasteryProgress adaptScore={adaptScore} />\n')
        has_adaptscore = False # only inject once per app
        injected_count += 1
        
    new_lines.append(line)

with open('client/src/App.jsx', 'w') as f:
    f.writelines(new_lines)

print(f"Injected into {injected_count} apps!")
