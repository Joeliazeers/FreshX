from ultralytics import YOLO

if __name__ == '__main__':
    print("Loading YOLOv8 Nano model...")
    model = YOLO('yolov8n.pt') 

    print("Starting training...")
    results = model.train(
        data='data.yaml', 
        epochs=30, 
        imgsz=640,
        plots=True
    )
    
    print("Training Complete. Model saved to 'runs/detect/train/weights/best.pt'")
