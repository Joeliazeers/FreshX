import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
import sys

# --- CONFIGURATION ---
MODEL_NAME = 'fruit'
if len(sys.argv) > 1:
    MODEL_NAME = sys.argv[1]
    
MODEL_PATH = f'{MODEL_NAME}_model.h5'
TEST_DIR = './Fruit Freshness/dataset/test' # Point to your Test folder

# Check if model exists
if not os.path.exists(MODEL_PATH):
    print(f"❌ Error: Model {MODEL_PATH} not found. Train it first!")
    exit()

# Load the "Best" Model (saved by Early Stopping)
print(f"Loading {MODEL_PATH}...")
model = load_model(MODEL_PATH)

# Prepare the Test Data (No augmentation, just rescaling)
test_datagen = ImageDataGenerator(rescale=1./255)

test_generator = test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=(150, 150),
    batch_size=16,
    class_mode='categorical',
    shuffle=False # IMPORTANT: Keep order so we can see which images failed if needed
)

# Run the Evaluation
print("Running final evaluation...")
results = model.evaluate(test_generator)

print("\n" + "="*30)
print(f"FINAL TEST RESULTS FOR {MODEL_NAME.upper()}")
print("="*30)
print(f"Loss:     {results[0]:.4f}")
print(f"Accuracy: {results[1]*100:.2f}%")
print("="*30)