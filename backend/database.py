import os
from pymongo import MongoClient
from bson.objectid import ObjectId

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client['freshx_db']
history_collection = db['history']

def insert_history_record(record):
    """Inserts a single record into the history collection."""
    return history_collection.insert_one(record)

def get_all_history(user_id=None):
    """
    Fetches history records. 
    If user_id is provided, filters by that specific user.
    """
    query = {}
    if user_id and user_id != 'anonymous':
        query['user_id'] = user_id

    cursor = history_collection.find(query).sort('timestamp', -1)
    
    history = []
    for doc in cursor:
        doc['_id'] = str(doc['_id'])
        history.append(doc)
    return history

def delete_history_record(item_id):
    """Deletes a specific history record by ID."""
    return history_collection.delete_one({'_id': ObjectId(item_id)})

def delete_all_history(user_id=None):
    """
    Deletes all history records.
    If user_id is provided, only deletes that user's history.
    """
    query = {}
    if user_id and user_id != 'anonymous':
        query['user_id'] = user_id
        
    return history_collection.delete_many(query)
