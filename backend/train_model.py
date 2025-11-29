import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import json
import os

# Define paths
train_dir = './Fruit Freshness/dataset/train'
test_dir = './Fruit Freshness/dataset/test'

# 1. DATA AUGMENTATION (Crucial for better accuracy)
# This creates "fake" variations of images (rotated, zoomed) so the model learns better
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,      # Rotate image
    width_shift_range=0.2,  # Shift sideways
    height_shift_range=0.2, # Shift vertically
    shear_range=0.2,        # Slant image
    zoom_range=0.2,         # Zoom in/out
    horizontal_flip=True,   # Mirror image
    fill_mode='nearest'
)

# Validation data should not be augmented, only rescaled
test_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(150, 150),
    batch_size=32,
    class_mode='categorical'
)

validation_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(150, 150),
    batch_size=32,
    class_mode='categorical'
)

# 2. SAVE CLASS INDICES
# Saves the map (e.g., {"fresh apples": 0, ...}) to a file to ensure backend matches perfectly
class_indices = train_generator.class_indices
with open('class_indices.json', 'w') as f:
    json.dump(class_indices, f)
print("Class indices saved to class_indices.json")

# 3. BUILD MODEL
model = Sequential([
    # First convolution
    Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    MaxPooling2D(2, 2),
    
    # Second convolution
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    
    # Third convolution
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    
    # Fourth convolution
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    
    Flatten(),
    Dropout(0.5), # Helps prevent overfitting
    Dense(512, activation='relu'),
    Dense(6, activation='softmax') # 6 classes (Fresh/Rotten * Apple/Banana/Orange)
])

model.compile(loss='categorical_crossentropy',
              optimizer='adam',
              metrics=['accuracy'])

# 4. TRAIN
history = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // 32,
    epochs=25, # You can increase this to 50 or 100 for even better results if needed
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // 32
)

model.save('fruit_model.h5')
print("Model saved as fruit_model.h5")