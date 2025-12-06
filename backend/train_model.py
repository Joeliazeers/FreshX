import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
import json
import os
import sys
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.utils import compute_class_weight

# --- CONFIGURATION ---
BATCH_SIZE = 16
EPOCHS = 50  # Using Early Stopping, so we set this high
TARGET_SIZE = (150, 150)

# Check for GPU
print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))

MODEL_NAME_BASE = 'fruit'
if len(sys.argv) > 1:
    MODEL_NAME_BASE = sys.argv[1]

MODEL_FILENAME = f'{MODEL_NAME_BASE}_model.h5'
INDICES_FILENAME = f'{MODEL_NAME_BASE}_class_indices.json'
HISTORY_CSV_FILENAME = f'{MODEL_NAME_BASE}_history.csv'
GRAPH_FILENAME = f'{MODEL_NAME_BASE}_training_graph.png'

# --- UPDATED PATHS ---
# Adjust these if your folders are named differently (e.g., 'validation' vs 'valid')
base_dir = './Fruit Freshness/dataset'
train_dir = os.path.join(base_dir, 'train')
val_dir   = os.path.join(base_dir, 'valid')  # Roboflow usually names this 'valid'
test_dir  = os.path.join(base_dir, 'test')   # We won't use this for training, only final checks

# Check if folders exist to avoid crashing
if not os.path.exists(val_dir):
    print(f"⚠️ WARNING: Validation folder not found at {val_dir}")
    print("Attempting to use 'test' folder as validation...")
    val_dir = test_dir

# --- 1. ROBUST DATA AUGMENTATION (Train Set Only) ---
# We apply the "Toughness" filters only to the training images.
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest',
    brightness_range=[0.6, 1.4],
    channel_shift_range=30.0
)

# Validation data should NOT be augmented (only rescaled)
# We want to test the AI on "real" normal images, not twisted ones.
val_datagen = ImageDataGenerator(rescale=1./255)

print("Loading Train Data...")
train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=TARGET_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

print("Loading Validation Data...")
validation_generator = val_datagen.flow_from_directory(
    val_dir,
    target_size=TARGET_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

NUM_CLASSES = len(train_generator.class_indices)

# Save Class Indices
class_indices = train_generator.class_indices
with open(INDICES_FILENAME, 'w') as f:
    json.dump(class_indices, f)
print(f"✅ Class indices saved to {INDICES_FILENAME}")

# --- 2. CLASS WEIGHTS ---
print("⚖️ Calculating Class Weights...")
cls_train = train_generator.classes
classes = np.unique(cls_train)
weights = compute_class_weight(
    class_weight='balanced', 
    classes=classes, 
    y=cls_train
)
class_weights_dict = dict(zip(classes, weights))
print(f"Class Weights: {class_weights_dict}")

# --- MODEL ARCHITECTURE ---
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    MaxPooling2D(2, 2),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Flatten(),
    Dropout(0.5),
    Dense(512, activation='relu'),
    Dense(NUM_CLASSES, activation='softmax')
])

model.compile(loss='categorical_crossentropy',
              optimizer='adam',
              metrics=['accuracy'])

# --- EARLY STOPPING ---
early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=10,
    restore_best_weights=True,
    verbose=1
)

# --- TRAINING ---
print(f"🚀 Starting TOUGH training for up to {EPOCHS} epochs...")
history = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // BATCH_SIZE,
    epochs=EPOCHS,
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // BATCH_SIZE,
    class_weight=class_weights_dict,
    callbacks=[early_stopping]
)

# --- SAVING ---
model.save(MODEL_FILENAME)
print(f"✅ Model saved as {MODEL_FILENAME}")

# --- 3. ANALYTICS ---
history_df = pd.DataFrame(history.history)
history_df.to_csv(HISTORY_CSV_FILENAME, index=False)

plt.figure(figsize=(12, 5))

# Plot Accuracy
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy', color='#10b981', linewidth=2)
plt.plot(history.history['val_accuracy'], label='Val Accuracy', color='#3b82f6', linewidth=2)
plt.title(f'Training Accuracy (Robust)')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(loc='lower right')

# Plot Loss
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss', color='#ef4444', linewidth=2)
plt.plot(history.history['val_loss'], label='Val Loss', color='#f59e0b', linewidth=2)
plt.title(f'Training Loss (Robust)')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(loc='upper right')

plt.tight_layout()
plt.savefig(GRAPH_FILENAME, dpi=300)
print(f"✅ Performance graph saved as {GRAPH_FILENAME}")
plt.show()