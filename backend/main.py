import asyncio
from fastapi import FastAPI, Query
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING
from bson import ObjectId
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import nltk

nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')

app = FastAPI()

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.search_engine
collection = db.documents

# Create text index
async def create_text_index():
    await collection.create_index([("content", "text")])

# Initialize text index and fit TF-IDF vectorizer
@app.on_event("startup")
async def startup_event():
    await create_text_index()
    await fit_vectorizer()

# Preprocess text
stop_words = set(stopwords.words('english'))
stemmer = PorterStemmer()

def preprocess_text(text):
    tokens = word_tokenize(text.lower())
    return [stemmer.stem(token) for token in tokens if token.isalnum() and token not in stop_words]

# TF-IDF vectorizer
vectorizer = TfidfVectorizer(tokenizer=preprocess_text)

async def fit_vectorizer():
    cursor = collection.find()
    documents = await cursor.to_list(length=None)
    corpus = [' '.join(preprocess_text(doc['content'])) for doc in documents]
    vectorizer.fit(corpus)

# Parallel search function
def parallel_search(query, doc):
    preprocessed_query = preprocess_text(query)
    preprocessed_doc = preprocess_text(doc['content'])

    # Calculate TF-IDF similarity
    query_vector = vectorizer.transform([' '.join(preprocessed_query)])
    doc_vector = vectorizer.transform([' '.join(preprocessed_doc)])
    similarity = (query_vector * doc_vector.T).toarray()[0][0]
    return {
        'id': str(doc['_id']),
        'title': doc['title'],
        'snippet': doc['content'][:200] + '...',
        'similarity': similarity
    }

@app.get("/search")
async def search(q: str = Query(..., min_length=1)):
    cursor = collection.find({"$text": {"$search": q}})
    documents = await cursor.to_list(length=100)

    with ThreadPoolExecutor() as executor:
        results = list(executor.map(lambda doc: parallel_search(q, doc), documents))

    # Sort results by similarity score
    sorted_results = sorted(results, key=lambda x: x['similarity'], reverse=True)

    return sorted_results[:10]  # Return top 10 results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
