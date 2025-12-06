# FreshX - AI-Powered Fruit Freshness Detector 🍎🍌🍊

![FreshX Banner](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TensorFlow](https://img.shields.io/badge/TensorFlow-Lite-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**FreshX** is a full-stack web application designed to classify the quality of fruits (Fresh vs. Rotten) in real-time. Leveraging deep learning and a microservices architecture, it provides an instant analysis tool for food quality control.

## 🔗 Live Demo

- [👉 FreshX (Deployed Web)](https://www.freshx.site/)
  _Note: The backend and frontend are hosted on a free tier, so the first request might take 30-60 seconds to wake up._

&nbsp;

## 🚀 Features

- **🤖 AI Inference Engine:** Uses a custom-trained Convolutional Neural Network (CNN) to detect freshness with high confidence.
- **📸 Dual Scanning:** Supports both **Live Camera Capture** and **File Upload**.
- **📊 Smart Analytics:** Visualizes detection history with pie charts and trend lines.
- **☁️ Cloud Sync:** Automatically saves all detection results to a MongoDB cloud database.
- **📱 Responsive Design:** Fully optimized for mobile and desktop usage using Tailwind CSS.

&nbsp;

## 🛠 Tech Stack

#### **Frontend (Client)**

- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS, Lucide React Icons
- **Data Visualization:** Recharts
- **Hosting:** Vercel

#

#### **Backend (Server)**

- **Framework:** Flask (Python)
- **AI Engine:** TensorFlow (CPU), Keras, NumPy, Pillow
- **Server:** Gunicorn
- **Hosting:** Railway

#

#### **Database**

- **Storage:** MongoDB Atlas (Cloud)
- **Driver:** PyMongo

&nbsp;

## 🏗 System Architecture

The project follows a decoupled Monorepo structure, deployed as two separate microservices:

```mermaid
    User[User Device] -- HTTPS --> Frontend[Vercel (React App)]
    Frontend -- REST API --> Backend[Railway (Flask API)]
    Backend -- Inference --> Model[AI Model (.h5)]
    Backend -- Read/Write --> DB[(MongoDB Atlas)]
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

```
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
