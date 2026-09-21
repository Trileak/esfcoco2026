"""
How this works:
This is a simple CNN model for image classification.
We use the BCE (Binary Cross Entropy) loss function to train the model.
This is because we are just trying to classify bread images into two categories: good and bad.
There are 5 Conv2d layers in the model (3 => 16 => 32 => 64 => 128 => 256).
Between each one there is a max pooling layer to reduce the spatial dimensions of the feature maps.
There is also a dropout layer to prevent overfitting.
Finally, we feed it into a linear layer to produce the output.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from PIL import Image

seed = 42
torch.manual_seed(seed)

# Training transform (with augmentation)
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(0.5),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
])

# Eval transform (no augmentation)
eval_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# 3. Model
class breadsort(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv4 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.conv5 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.dropout = nn.Dropout(0.25)
        self.linear = nn.Linear(256 * 7 * 7, 1)

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = torch.max_pool2d(x, kernel_size=2, stride=2)

        x = torch.relu(self.conv2(x))
        x = torch.max_pool2d(x, kernel_size=2, stride=2)

        x = torch.relu(self.conv3(x))
        x = torch.max_pool2d(x, kernel_size=2, stride=2)

        x = torch.relu(self.conv4(x))
        x = torch.max_pool2d(x, kernel_size=2, stride=2)

        x = torch.relu(self.conv5(x))
        x = torch.max_pool2d(x, kernel_size=2, stride=2)

        x = x.view(x.size(0), -1)
        x = self.dropout(x)
        return self.linear(x)

def train():
    dataset = datasets.ImageFolder(root='./Bread', transform=train_transform)
    print(f"Class mapping: {dataset.class_to_idx}")

    data_loader = DataLoader(dataset, batch_size=32, shuffle=True, drop_last=True)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using: {device}")
    model = breadsort().to(device)
    model.train()
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    criterion = nn.BCEWithLogitsLoss()

    num_epochs = 25

    for epoch in range(num_epochs):
        epoch_loss = 0.0
        num_batches = 0

        for x_batch, y_batch in data_loader:
            x_batch = x_batch.to(device)
            y_batch = y_batch.to(device).float().unsqueeze(1)

            optimizer.zero_grad()
            logits = model(x_batch)
            loss = criterion(logits, y_batch)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()
            num_batches += 1

        print(f"Epoch {epoch}: loss = {epoch_loss / num_batches:.4f}")

    print("Training done. Saving...")
    torch.save(model.state_dict(), 'bread_model.pth')
    print("Model saved to bread_model.pth")

def predict(image_path):
    img = Image.open(image_path)
    img_tensor = eval_transform(img).unsqueeze(0)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using: {device}")
    model = breadsort().to(device)
    model.load_state_dict(torch.load('bread_model.pth', weights_only=True))
    model.eval()

    img_tensor = img_tensor.to(device)

    with torch.no_grad():
        logit = model(img_tensor)
        prob = torch.sigmoid(logit).item()

    label = "Good" if prob > 0.5 else "Bad"
    confidence = (1 - prob if prob <= 0.5 else prob) * 100
    print(f"Prediction: {label} (confidence: {confidence:.2f}%)")

if __name__ == "__main__":
    train()
    predict('./test.jpeg')