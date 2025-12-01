import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import json
import os
import sys


MODEL_NAME_BASE = 'fruit'
if len(sys.argv) > 1:
    MODEL_NAME_BASE = sys.argv[1]

MODEL_FILENAME = f'{MODEL_NAME_BASE}_model.h5'
INDICES_FILENAME = f'{MODEL_NAME_BASE}_class_indices.json'

train_dir = '../Fruit Freshness/dataset/train'
test_dir = '../Fruit Freshness/dataset/test'

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

test_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(150, 150),
    batch_size=16,
    class_mode='categorical'
)

validation_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(150, 150),
    batch_size=16,
    class_mode='categorical'
)

NUM_CLASSES = len(train_generator.class_indices)

class_indices = train_generator.class_indices
with open(INDICES_FILENAME, 'w') as f:
    json.dump(class_indices, f)
print(f"Class indices saved to {INDICES_FILENAME}")

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

model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // 16,
    epochs=25,
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // 16
)

model.save(MODEL_FILENAME)
print(f"Model saved as {MODEL_FILENAME}")