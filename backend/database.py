import os
from pymongo import MongoClient
from bson.objectid import ObjectId

# Configuration
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")

# Initialize Client
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client['freshx_db']
history_collection = db['history']

def insert_history_record(record):
    """Inserts a single record into the history collection."""
    return history_collection.insert_one(record)

def get_all_history():
    """Fetches all history records sorted by timestamp (newest first)."""
    cursor = history_collection.find().sort('timestamp', -1)
    history = []
    for doc in cursor:
        doc['_id'] = str(doc['_id'])
        history.append(doc)
    return history

def delete_history_record(item_id):
    """Deletes a specific history record by ID."""
    return history_collection.delete_one({'_id': ObjectId(item_id)})

def delete_all_history():
    """Deletes all history records."""
    return history_collection.delete_many({})