# 🍏 **FreshX: AI-Powered Fruit Freshness Scanner** 🍎

**FreshX** is a full-stack application that uses a custom-trained Convolutional Neural Network (CNN) to classify whether an image of a common fruit (Apple, Banana, Orange) is **Fresh** or **Rotten**. It provides instant classification results and tracks all detection history using MongoDB.

✨ **Features**

- ⚡ **Real-Time Classification**: Upload an image via drag-and-drop or file selection and get an instant freshness prediction.

- 🧠 **Custom CNN Model**: The Python backend utilizes TensorFlow/Keras, trained on a comprehensive Kaggle dataset, to achieve high-confidence results.

- 📂 **Persistent History**: All prediction results, including confidence scores and labels, are saved to a MongoDB database.

- 📊 **History Tab**: A dedicated tab in the frontend allows users to view a chronological log of all previous scans.

- 🎨 **Modern UI**: Built with React and Tailwind CSS for a dark-themed, responsive, and intuitive user experience.

- 🔗 **Unified Development**: Uses `concurrently` to start both the Python Flask API and the React development server with a single command.

‎

🛠️ **Technology Stack**

| **Component**     | **Technology**            | **Role**                                                          |
| ----------------- | ------------------------- | ----------------------------------------------------------------- |
| **Frontend**      | `React.js + Tailwind CSS` | Single-page user interface (Scanner & History Tabs)               |
| **Backend (API)** | `Flask`                   | Lightweight Python server to handle image uploads and predictions |
| **AI/ML**         | `TensorFlow / Keras`      | Loads and runs the `fruit_model.h5` CNN model                     |
| **Database**      | `MongoDB`                 | Stores all historical prediction data                             |
| **Development**   | `concurrently` `NPM`      | `Starts both the Flask and Vite servers simultaneously`           |

‎

🚀 **Setup and Installation**

Follow these steps to get the development environment running locally.

‎

**Prerequisites**

- **Python 3.8+** and `pip`

- **Node.js & npm**

- **MongoDB Server**: Must be running locally on the default port (`27017`).

‎

**1. Backend Setup (AI Model & API)**

Navigate to the `backend` directory, create a virtual environment, and install dependencies.

```
# Navigate to the backend directory
cd backend

# Create and activate the Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Use '.venv\\Scripts\\python.exe app.py' on Windows

# Install Python dependencies (Flask, TensorFlow, PyMongo, etc.)
pip install -r requirements.txt

# --- CRITICAL: Train the Model ---
# This step creates the required 'fruit_model.h5' and 'class_indices.json' files.
# Ensure your dataset is located at the path defined in train_model.py
python train_model.py

# Deactivate the environment
deactivate
```

‎

**2. Frontend Setup (React & Development Tools)**

Navigate to the `frontend` directory and install Node dependencies, including `concurrently`.

```
# Navigate to the frontend directory
cd ../frontend

# Install Node dependencies
npm install

# Install concurrently for combined start-up
npm install concurrently
```

‎

**3. Run the Application**

From the `frontend` directory, run the main development script. This will automatically start the Python Flask server and the React Vite server.

```
npm run dev
```

The application should now be available at `http://localhost:5173/`.

‎

🧑‍💻 **Usage**
‎

**Scanner Tab**

‎‎ 1. Access the app at `http://localhost:5173/`.

‎ 2. Drag and drop or click to upload a fruit image (Apple, Banana, or Orange).

‎ 3. Click "**Start Detection**".

‎ 4. The result will show the predicted label (e.g., "Fresh Apple"), the **Fresh/Rotten** status, and the confidence percentage.

‎

**History Tab**

‎ 1. Click the "**History**" tab in the header.

‎ 2. The application fetches all past prediction results from the MongoDB database, showing the outcome, confidence, and timestamp.

‎ 3. Use the "**Refresh**" button to manually update the list with the latest data from the database.

‎

📜 **License**

This project is licensed under the **MIT License**. See the `LICENSE.md` file for details.
