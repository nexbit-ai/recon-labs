import re

filepath = 'src/pages/OperationsCentre.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace variant="contained" with variant="outlined"
content = re.sub(r'variant=[\'"]contained[\'"]', 'variant="outlined"', content)
content = re.sub(r'variant=\{\s*[\'"]contained[\'"]\s*\}', 'variant="outlined"', content)

# Specific purple background replacements:
# Line 2893 etc: background: '#7A5DBF', color: 'white'
content = content.replace("background: '#7A5DBF', \n                          color: 'white',", "")
content = content.replace("background: '#7A5DBF',\n                          color: 'white',", "")
content = content.replace("background: '#7A5DBF', \n                          color: 'white'", "")
content = content.replace("background: '#7A5DBF',\n                          color: 'white'", "")
content = content.replace("background: '#7A5DBF', \n                          color: 'white', \n", "")

content = content.replace("background: '#7A5DBF', color: 'white', ", "")
content = content.replace("background: '#7A5DBF', color: 'white'", "")
content = content.replace("background: '#7A5DBF', ", "")
content = content.replace("background: '#7A5DBF',", "")

content = content.replace("'&:hover': { background: '#624a9e', boxShadow: 'none' }", "")
content = content.replace("'&:hover': { background: '#624a9e' },", "")
content = content.replace("'&:hover': { background: '#624a9e' }", "")

content = re.sub(r'sx=\{\{\s*,\s*', 'sx={{ ', content)
content = re.sub(r',\s*,\s*', ', ', content)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Updated {filepath}")
