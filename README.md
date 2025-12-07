# FreshX - AI-Powered Fruit Freshness Detector 🍎🍌🍊

![FreshX Banner](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Object_Detection-0000FF?style=for-the-badge&logo=yolo&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**FreshX** is a full-stack web application designed to detect and classify fruit quality (Fresh vs. Rotten) in real-time. Moving beyond simple classification, it utilizes **YOLOv8 Object Detection** to localize fruits within complex environments, ignoring background noise like cables or dark desks.

## 🔗 Live Demo

- [👉 FreshX (Deployed Web)](https://www.freshx.site/)
  _Note: The backend is hosted on a free tier; the first request might take 30-60 seconds to wake up._

&nbsp;

## 🚀 Features

- **👁️ YOLOv8 Object Detection:** Uses a custom-trained YOLOv8 Nano model to draw bounding boxes around fruits, offering superior accuracy in "messy" environments compared to standard classification.
- **⚡ Smart Live Scanning:** Features a recursive "Smart Loop" camera mode that analyzes video frames in real-time without lag.
- **🏆 "King of the Hill" Logic:** Automatically captures multiple frames and saves only the detection with the highest confidence score.
- **📊 Smart Analytics:** Visualizes detection history with pie charts and trend lines.
- **☁️ Cloud Sync:** Automatically saves detection metadata to MongoDB Atlas.

&nbsp;

## 🛠️ Tech Stack

#### **Frontend (Client)**

- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS, Lucide React Icons
- **Real-time Logic:** Recursive async frame capture
- **Hosting:** Vercel

#

#### **Backend (Server)**

- **Framework:** Flask (Python)
- **AI Engine:** Ultralytics YOLOv8 (PyTorch)
- **Image Processing:** Pillow (PIL), NumPy
- **Hosting:** Railway

#

#### **Database**

- **Storage:** MongoDB Atlas (Cloud)
- **Driver:** PyMongo

&nbsp;

## 🏗️ System Architecture

The project follows a decoupled Monorepo structure, deployed as two separate microservices:

```mermaid
flowchart LR
    User["User Device"]
    Frontend["Frontend (Vercel - React App)"]
    Backend["Backend (Railway - Flask API)"]
    Model["YOLOv8 Model (.pt)"]
    DB["MongoDB Atlas"]

    User -- "HTTPS" --> Frontend
    Frontend -- "REST API (Images)" --> Backend
    Backend -- "Object Detection" --> Model
    Backend -- "Read/Write" --> DB
```

&nbsp;

## ⚙️ Local Installation Guide

Follow these steps to run the project on your local machine.
&nbsp;

#### 1. Clone the Repository

```markdown
➤ git clone https://github.com/Joeliazeers/FreshX.git
➤ cd freshx
```

#### 2. Backend Setup

```markdown
1. Create a virtual environment
   ➤ python -m venv .venv

2. Activate the environment
   Windows:
   ➤ .venv\Scripts\activate
   Mac/Linux:
   ➤ source .venv/bin/activate

3. Install dependencies
   ➤ pip install -r requirements.txt

4. Set your Database Connection (Replace with your actual string)
   Windows PowerShell:
   ➤ $env:MONGO_URI="mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/freshx_db"
   Mac/Terminal:
   ➤ export MONGO_URI="mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/freshx_db"

5. Run the Server
   ➤ python app.py
```

#### 3. Frontend Setup

```markdown
➤ cd frontend

1. Install Node modules
   ➤ npm install

2. Configure Local API Link
   ➤ Create a file named .env.local inside the /frontend folder
   Add this line:
   ➤ VITE_API_URL=http://localhost:5000

3. Run the Client
   ➤ npm run dev
```

&nbsp;

## 📡 API Documentation

| Method     | Endpoint        | Description                                            |
| :--------- | :-------------- | :----------------------------------------------------- |
| **POST**   | `/predict`      | Analyzes uploaded image for freshness.                 |
| **GET**    | `/history`      | Fetches the list of all past predictions from MongoDB. |
| **DELETE** | `/history/<id>` | Deletes a single history record by ID.                 |
| **DELETE** | `/history`      | Clears the entire database history.                    |

&nbsp;

## 📄 License

This project is created for educational purposes and assignment submission.
