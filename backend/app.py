from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import base64
import numpy as np
import os
from datetime import datetime
from database import insert_history_record, get_all_history, delete_history_record, delete_all_history

app = Flask(__name__)
CORS(app)

print("Loading YOLOv8 Model...")
try:
    model = YOLO('best.pt')
    print("YOLOv8 Model Loaded Successfully!")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    print("Did you move 'best.pt' to the backend folder?")

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    user_id = request.headers.get('x-device-id', 'anonymous')

    try:
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))

        results = model.predict(image, conf=0.50) 
        result = results[0]
        
        highest_conf = 0
        primary_label = "No Fruit Detected"
        is_fresh = False
        
        if len(result.boxes) > 0:
            for box in result.boxes:
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                label_name = result.names[cls_id]
                
                if conf > highest_conf:
                    highest_conf = conf
                    primary_label = label_name
                    lower_label = label_name.lower()
                    if "fresh" in lower_label:
                        is_fresh = True
                    elif "rotten" in lower_label:
                        is_fresh = False
                    else:
                        is_fresh = False 

        annotated_array = result.plot() 
        annotated_img = Image.fromarray(annotated_array[..., ::-1]) 
        
        buffer = io.BytesIO()
        annotated_img.save(buffer, format='JPEG')
        heatmap_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        response_data = {
            'label': primary_label.title(),
            'confidence': float(highest_conf * 100),
            'is_fresh': is_fresh,
            'model_used': 'YOLOv8',
            'heatmap_b64': heatmap_b64 
        }

        try:
            history_record = {
                "user_id": user_id,  
                "filename": file.filename,
                **response_data,
                "timestamp": datetime.now().isoformat()
            }
            history_record.pop('heatmap_b64', None) 
            
            insert_history_record(history_record)
        except Exception as e:
            print(f"Database Error: {e}")

        return jsonify(response_data)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    user_id = request.headers.get('x-device-id', 'anonymous')
    
    try:
        history = get_all_history(user_id)
        
        for item in history:
            if '_id' in item:
                item['_id'] = str(item['_id'])
                
        return jsonify(history)
    except Exception as e:
        print(f"Fetch History Error: {e}")
        return jsonify([]), 200

@app.route('/history', methods=['DELETE'])
def clear_all_history():
    user_id = request.headers.get('x-device-id', 'anonymous')
    try:
        result = delete_all_history(user_id)
        return jsonify({'message': f'Deleted {result.deleted_count} records'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history/<item_id>', methods=['DELETE'])
def delete_history_item(item_id):
    try:
        result = delete_history_record(item_id)
        if result.deleted_count > 0:
            return jsonify({'message': 'Deleted'})
        else:
            return jsonify({'error': 'Not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', debug=True, port=port)
