import asyncio
from quart import Quart, request, jsonify
from motor.motor_asyncio import AsyncIOMotorClient
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from concurrent.futures import ThreadPoolExecutor
import nltk
from dotenv import load_dotenv
from pymongo.server_api import ServerApi
import os
import hypercorn.asyncio
import hypercorn.config

load_dotenv(dotenv_path='.env.local')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

# Initialize NLTK data
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')

# Initialize Flask app
uri = f"mongodb+srv://{DB_USER}:{DB_PASSWORD}@cluster0.ncedv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# MongoDB connection
# client = AsyncIOMotorClient("mongodb://localhost:27017")
client = AsyncIOMotorClient(uri, server_api=ServerApi('1'))
db = client.search_engine
collection = db.documents
print("Connection to MongoDB successful!...")

app = Quart(__name__)

# Preprocess text
stop_words = set(stopwords.words('english'))
stemmer = PorterStemmer()

def preprocess_text(text):
    tokens = word_tokenize(text.lower())
    return [stemmer.stem(token) for token in tokens if token.isalnum() and token not in stop_words]

# TF-IDF vectorizer
vectorizer = TfidfVectorizer(tokenizer=preprocess_text)

async def fit_vectorizer():
    """Load documents from MongoDB and fit the TF-IDF vectorizer."""
    cursor = collection.find()
    documents = await cursor.to_list(length=None)
    corpus = [' '.join(preprocess_text(doc['content'])) for doc in documents]
    vectorizer.fit(corpus)

# Create text index
async def create_text_index():
    """Create a text index on the content and title fields."""
    await collection.create_index([("content", "text"), ("title", "text")])

async def initialize_app():
    """Initialize text index and fit vectorizer before app starts."""
    await create_text_index()
    await fit_vectorizer()

# Parallel search function
def parallel_search(query, doc, field):
    preprocessed_query = preprocess_text(query)
    
    if field == "content":
        preprocessed_doc = preprocess_text(doc.get('content', ''))
    elif field == "title":
        preprocessed_doc = preprocess_text(doc.get('title', ''))
    else:  # both
        preprocessed_doc = preprocess_text(doc.get('content', '') + " " + doc.get('title', ''))

    # Calculate TF-IDF similarity
    query_vector = vectorizer.transform([' '.join(preprocessed_query)])
    doc_vector = vectorizer.transform([' '.join(preprocessed_doc)])
    similarity = (query_vector * doc_vector.T).toarray()[0][0]

    return {
        'id': str(doc['_id']),
        'title': doc.get('title', ''),
        'snippet': doc.get('content', '')[:200] + '...',
        'similarity': similarity
    }

@app.route("/")
async def home():
    return "Welcome to the search engine API! Use the /search endpoint to search for documents."

@app.route("/search", methods=["GET"])
async def search():
    """Search endpoint to retrieve relevant documents."""
    query = request.args.get("q")
    sort = request.args.get("sort", "relevance_desc")
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 10))
    field = request.args.get("field", "both").lower()
    threshold = float(request.args.get("threshold", 0.1))

    if not query or len(query) < 1:
        return jsonify({"error": "Query parameter `q` is required and must be at least 1 character long."}), 400

    # MongoDB query based on the field
    if field == "content":
        mongo_query = {"$text": {"$search": query}, "content": {"$exists": True}}
    elif field == "title":
        mongo_query = {"$text": {"$search": query}, "title": {"$exists": True}}
    else:  # both
        mongo_query = {"$text": {"$search": query}}

    cursor = collection.find(mongo_query)
    documents = await cursor.to_list(length=100)

    with ThreadPoolExecutor() as executor:
        loop = asyncio.get_event_loop()
        all_results = await loop.run_in_executor(executor, lambda: list(map(lambda doc: parallel_search(query, doc, field), documents)))

    filtered_results = [result for result in all_results if result['similarity'] > threshold]

    sorted_results = sorted(
        filtered_results,
        key=lambda x: x['similarity'],
        reverse=(False if sort == 'relevance_asc' else True)
    )

    # Paginate results
    total_results = len(sorted_results)
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_results = sorted_results[start_index:end_index]

    return jsonify({
        'current_page': page,
        'results': paginated_results,
        'total_pages': (total_results + page_size - 1) // page_size
    })

@app.before_serving
async def startup():
    """Run initialization before the app starts serving requests."""
    await initialize_app()

if __name__=='__main__':
    config = hypercorn.config.Config()
    config.bind = ["0.0.0.0:{}".format(os.environ.get('PORT', 8000))]
    hypercorn.asyncio.serve(app, config)