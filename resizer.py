from PIL import Image
import os
from pathlib import Path

# Make output folders
Path('./Bread-resized/Bad').mkdir(parents=True, exist_ok=True)
Path('./Bread-resized/Good').mkdir(parents=True, exist_ok=True)

# Resize Bad folder
for img_name in os.listdir('./Bread/Bad'):
    if img_name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        img = Image.open(f'./Bread/Bad/{img_name}')
        img_resized = img.resize((224, 224), Image.Resampling.LANCZOS)
        img_resized.save(f'./Bread-resized/Bad/{img_name}')
        print(f"Resized: Bad/{img_name}")

# Resize Good folder
for img_name in os.listdir('./Bread/Good'):
    if img_name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        img = Image.open(f'./Bread/Good/{img_name}')
        img_resized = img.resize((224, 224), Image.Resampling.LANCZOS)
        img_resized.save(f'./Bread-resized/Good/{img_name}')
        print(f"Resized: Good/{img_name}")