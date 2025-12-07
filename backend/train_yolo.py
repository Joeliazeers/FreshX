from ultralytics import YOLO

if __name__ == '__main__':
    # 1. Load the model (yolov8n.pt is the "nano" version - fastest for CPU)
    print("Loading YOLOv8 Nano model...")
    model = YOLO('yolov8n.pt') 

    # 2. Train it
    # data='data.yaml' -> Points to your dataset configuration
    # epochs=20 -> Quick training
    # imgsz=640 -> Standard YOLO size
    print("Starting training...")
    results = model.train(
        data='data.yaml', 
        epochs=30, 
        imgsz=640,
        plots=True
    )

    # 3. Export the best model
    # It usually saves to runs/detect/train/weights/best.pt
    print("Training Complete. Model saved to 'runs/detect/train/weights/best.pt'")