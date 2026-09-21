from PIL import Image
import torch
from torchvision import transforms
import torch.nn as nn
from main import breadsort
import matplotlib.pyplot as plt

# Load and prep image
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(0.5),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
])

eval_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

img = Image.open('./test.jpeg')
img_tensor = eval_transform(img).unsqueeze(0)

# Load model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using: {device}")

model = breadsort().to(device)
model.load_state_dict(torch.load('bread_model.pth', weights_only=True))
model.eval()

# Move tensor to device
img_tensor = img_tensor.to(device)

# Predict
with torch.no_grad():
    logit = model(img_tensor)
    prob = torch.sigmoid(logit).item()

# Print result
label = "Good" if prob > 0.5 else "Bad"
confidence = (1-prob if prob <= 0.5 else prob) * 100
print(f"Prediction: {label} (confidence: {confidence:.2f}%)")

# Display with matplotlib
plt.figure(figsize=(8, 8))
plt.imshow(img)
plt.title(f"Prediction: {label} ({confidence:.2f}%)", fontsize=16, fontweight='bold')
plt.axis('off')
plt.tight_layout()
plt.show()