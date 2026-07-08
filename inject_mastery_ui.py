import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# We can just replace all occurrences of:
# <div className="score-pill">Score: {score}</div>
#       </div>
#       <h1>
# WITH:
# <div className="score-pill">Score: {score}</div>
#       </div>
#       <MasteryProgress adaptScore={typeof adaptScore !== 'undefined' ? adaptScore : undefined} />
#       <h1>

# Wait, `typeof adaptScore` might throw if not defined in strict mode? No, `typeof adaptScore` is safe even if undefined.
# But it's better to just inject it where `adaptScore` is actually defined.

# Let's chunk the file into functions:
lines = text.split('\n')
new_lines = []
in_app = False
has_adaptscore = False
for i, line in enumerate(lines):
    if line.startswith('function ') and 'App(' in line:
        in_app = True
        has_adaptscore = False
    
    if in_app and 'adaptScore' in line:
        has_adaptscore = True
        
    if in_app and has_adaptscore and '<h1' in line:
        # Inject just before this line
        indent = re.match(r'^(\s*)', line).group(1)
        new_lines.append(indent + '<MasteryProgress adaptScore={adaptScore} />')
        has_adaptscore = False # Only inject once per app
        
    new_lines.append(line)

with open('client/src/App.jsx', 'w') as f:
    f.write('\n'.join(new_lines))

print("Done injecting MasteryProgress!")
