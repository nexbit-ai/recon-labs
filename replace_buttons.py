import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # Replace variant="contained" or variant={'contained'} or variant='contained' with variant="outlined"
    content = re.sub(r'variant=[\'"]contained[\'"]', 'variant="outlined"', content)
    content = re.sub(r'variant=\{\s*[\'"]contained[\'"]\s*\}', 'variant="outlined"', content)
    
    # Remove purple background and hover styles for buttons
    # Specifically targeting the known strings in OperationsCentre.tsx
    content = content.replace("background: '#7A5DBF', color: 'white', ", "")
    content = content.replace("background: '#7A5DBF', color: 'white',", "")
    content = content.replace("background: '#7A5DBF', ", "")
    content = content.replace("background: '#7A5DBF',", "")
    content = content.replace("background: '#7A5DBF'", "")
    
    content = content.replace("'&:hover': { background: '#624a9e', boxShadow: 'none' }", "")
    content = content.replace("'&:hover': { background: '#624a9e' },", "")
    content = content.replace("'&:hover': { background: '#624a9e' }", "")
    content = content.replace("&:hover: { background: '#624a9e' }", "")
    
    # Cleanup empty sx spaces
    content = re.sub(r'sx=\{\{\s*,\s*', 'sx={{ ', content)
    content = re.sub(r',\s*,\s*', ', ', content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))
