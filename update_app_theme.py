filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Find MuiButton section and add defaultProps if not exists
if 'MuiButton: {' in content and 'defaultProps:' not in content:
    content = content.replace(
        'MuiButton: {',
        "MuiButton: {\n      defaultProps: {\n        variant: 'outlined',\n      },"
    )
    with open(filepath, 'w') as f:
        f.write(content)
    print("Updated App.tsx theme for MuiButton")
