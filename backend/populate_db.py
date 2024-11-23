from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def populate_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.search_engine
    collection = db.documents

    sample_documents = [
        {
            "title": "Introduction to Big Data",
            "content": "Big Data refers to extremely large datasets that may be analyzed computationally to reveal patterns, trends, and associations. It is characterized by the three Vs: Volume, Velocity, and Variety."
        },
        {
            "title": "Data Structures for Big Data",
            "content": "Efficient data structures are crucial for handling Big Data. Some commonly used structures include B-trees, LSM trees, and Bloom filters. These structures help in indexing and quick retrieval of data."
        },
        {
            "title": "Parallel Algorithms in Big Data",
            "content": "Parallel algorithms are essential in Big Data processing. Examples include parallel sorting algorithms like parallel merge sort and parallel quicksort, as well as parallel matrix algorithms for large-scale computations."
        },
        {
            "title": "MapReduce Framework",
            "content": "MapReduce is a programming model for processing and generating big data sets. It consists of a Map() function that performs filtering and sorting, and a Reduce() function that performs a summary operation."
        },
        {
            "title": "MongoDB for Big Data",
            "content": "MongoDB is a popular NoSQL database used in Big Data applications. It provides high performance, high availability, and easy scalability. Its document-based structure allows for flexible and schema-less data models."
        }
    ]

    await collection.insert_many(sample_documents)
    print("Sample documents inserted successfully!")

if __name__ == "__main__":
    asyncio.run(populate_db())