from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure, ServerSelectionTimeoutError
from datetime import datetime

app = Flask(__name__)
CORS(app)

# MongoDB connection setup
MONGO_URI = 'mongodb://localhost:27017/'

# Initialize MongoClient. 
# We do NOT set this to None if it fails initially. Pymongo handles auto-reconnection.
# serverSelectionTimeoutMS=5000 means it will wait 5 seconds before giving up on a query.
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client['freshx_db']
history_collection = db['history']

MODEL_PATH = 'fruit_model.h5'
INDICES_PATH = 'class_indices.json'

model = None
class_labels = {}

def load_model_and_indices():
    global model, class_labels
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully")
        
        if os.path.exists(INDICES_PATH):
            with open(INDICES_PATH, 'r') as f:
                indices = json.load(f)
                class_labels = {v: k for k, v in indices.items()}
                print(f"Loaded class labels: {class_labels}")
        else:
            print("Warning: class_indices.json not found. Predictions might be wrong.")
            
    except Exception as e:
        print(f"Error loading model or indices: {e}")

load_model_and_indices()

def prepare_image(image, target_size):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0
    return image

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if model is None:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 500

    try:
        image = Image.open(io.BytesIO(file.read()))
        processed_image = prepare_image(image, target_size=(150, 150))
        
        prediction = model.predict(processed_image)
        confidence = np.max(prediction)
        class_idx = np.argmax(prediction)
        
        raw_label = class_labels.get(class_idx, "Unknown")
        label_formatted = raw_label.replace('_', ' ').title()
        
        is_fresh = "fresh" in raw_label.lower()
        
        response_data = {
            'label': label_formatted,
            'confidence': float(confidence * 100),
            'is_fresh': is_fresh
        }

        # Attempt to save history
        # We use a try/except here so that if MongoDB is down, the user still gets their prediction result.
        try:
            history_record = {
                "filename": file.filename,
                **response_data,
                "timestamp": datetime.now().isoformat()
            }
            history_collection.insert_one(history_record)
            print("History saved successfully.")
        except (ConnectionFailure, ServerSelectionTimeoutError, OperationFailure) as db_e:
            print(f"Warning: Failed to save history to MongoDB (is it running?): {db_e}")
        
        return jsonify(response_data)
    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    try:
        # Check connection implicitly by attempting a query
        # This will wait up to 5 seconds (configured above) if the server is unreachable
        history = list(history_collection.find({}, {'_id': 0}).sort('timestamp', -1))
        return jsonify(history)
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"History fetch error: {e}")
        return jsonify({'error': 'Database unavailable. Make sure MongoDB is running.'}), 503
    except Exception as e:
        print(f"General History Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)