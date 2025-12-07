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

# --- CONFIGURATION ---
# Load the YOLO Model (Ensure best.pt is in the same folder)
print("Loading YOLOv8 Model...")
try:
    model = YOLO('best.pt')
    print("✅ YOLOv8 Model Loaded Successfully!")
except Exception as e:
    print(f"❌ Error loading YOLO model: {e}")
    print("Did you move 'best.pt' to the backend folder?")
# ---------------------

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 1. Read Image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # 2. Run YOLO Inference
        # conf=0.25 -> Only accept detections with >25% confidence
        results = model.predict(image, conf=0.50) 
        
        result = results[0] # Get first result
        
        # 3. Process Detections
        highest_conf = 0
        primary_label = "No Fruit Detected"
        is_fresh = False
        
        if len(result.boxes) > 0:
            # Find the detection with highest confidence
            for box in result.boxes:
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                label_name = result.names[cls_id]
                
                if conf > highest_conf:
                    highest_conf = conf
                    primary_label = label_name
                    
                    # Logic: Determine Freshness based on label name
                    # Adjust this logic based on your exact RoboFlow label names!
                    # Example labels: "Fresh Apple", "Rotten Banana", "fresh_orange"
                    lower_label = label_name.lower()
                    if "fresh" in lower_label:
                        is_fresh = True
                    elif "rotten" in lower_label:
                        is_fresh = False
                    else:
                        # Fallback if label is just "Apple" (assume fresh? or check dataset)
                        is_fresh = False 

        # 4. Generate "Heatmap" (Annotated Image with Boxes)
        # YOLO has a built-in plotter that returns a BGR numpy array
        annotated_array = result.plot() 
        
        # Convert BGR (OpenCV format) to RGB (PIL format)
        annotated_img = Image.fromarray(annotated_array[..., ::-1]) 
        
        # Encode to Base64 for Frontend
        buffer = io.BytesIO()
        annotated_img.save(buffer, format='JPEG')
        heatmap_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        # 5. Prepare Response
        response_data = {
            'label': primary_label.title(),
            'confidence': float(highest_conf * 100),
            'is_fresh': is_fresh,
            'model_used': 'YOLOv8',
            'heatmap_b64': heatmap_b64 # Frontend will display the box image here
        }

        # 6. Save to History (Without the massive image string)
        try:
            history_record = {
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

# ... (Keep your History endpoints: /history GET and DELETE) ...
# Paste the rest of your history/database routes here if they are missing
@app.route('/history', methods=['GET'])
def get_history():
    return jsonify(get_all_history())

@app.route('/history', methods=['DELETE'])
def clear_all_history():
    return jsonify({'message': f'Deleted {delete_all_history().deleted_count} records'})

@app.route('/history/<item_id>', methods=['DELETE'])
def delete_history_item(item_id):
    result = delete_history_record(item_id)
    return jsonify({'message': 'Deleted'}) if result.deleted_count > 0 else (jsonify({'error': 'Not found'}), 404)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', debug=True, port=port)