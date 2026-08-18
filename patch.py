import os

REPLACEMENTS = [
    ("—", "-"),
    ("Flipkart", "Myntra"),
    ("flipkart", "myntra"),
    ("FLIPKART", "MYNTRA"),
    ("sales-working-fk", "sales-working-myntra"),
]

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for old, new in REPLACEMENTS:
            new_content = new_content.replace(old, new)
            
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
    except Exception as e:
        pass

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx') or file.endswith('.csv'):
            process_file(os.path.join(root, file))
