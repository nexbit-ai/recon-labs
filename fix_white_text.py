import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # We replaced background but left color: 'white' in some places. Let's clean it.
    content = content.replace("color: 'white',", "")
    content = content.replace("color: 'white'", "")
    
    # Cleanup empty lines in sx block
    content = re.sub(r'sx=\{\{\s*,\s*', 'sx={{ ', content)
    content = re.sub(r',\s*,\s*', ', ', content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

process_file('src/pages/OperationsCentre.tsx')
