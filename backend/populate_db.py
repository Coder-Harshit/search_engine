from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import re

async def fetch_page(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

async def parse_page(html):
    soup = BeautifulSoup(html, 'html.parser')
    # Extract title from metadata
    title_tag = soup.find('meta', attrs={"name": "title"}) or soup.find('meta', property="og:title")
    title = title_tag['content'] if title_tag else soup.find('title').text
    # Extract main content from the body
    content = soup.find('body').text
    return {"title": title, "content": format_text(content)}

def format_text(text):
    # Remove extra whitespaces
    text = re.sub(r'\s+', ' ', text)
    # Remove leading and trailing whitespaces
    text = text.strip()
    # Additional formatting can be added here if needed
    return text

async def crawl_and_populate_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.search_engine
    collection = db.documents

    # sample_documents = [
    #     {
    #         "title": "Introduction to Big Data",
    #         "content": "Big Data refers to extremely large datasets that may be analyzed computationally to reveal patterns, trends, and associations. It is characterized by the three Vs: Volume, Velocity, and Variety."
    #     },
    #     {
    #         "title": "Data Structures for Big Data",
    #         "content": "Efficient data structures are crucial for handling Big Data. Some commonly used structures include B-trees, LSM trees, and Bloom filters. These structures help in indexing and quick retrieval of data."
    #     },
    #     {
    #         "title": "Parallel Algorithms in Big Data",
    #         "content": "Parallel algorithms are essential in Big Data processing. Examples include parallel sorting algorithms like parallel merge sort and parallel quicksort, as well as parallel matrix algorithms for large-scale computations."
    #     },
    #     {
    #         "title": "MapReduce Framework",
    #         "content": "MapReduce is a programming model for processing and generating big data sets. It consists of a Map() function that performs filtering and sorting, and a Reduce() function that performs a summary operation."
    #     },
    #     {
    #         "title": "MongoDB for Big Data",
    #         "content": "MongoDB is a popular NoSQL database used in Big Data applications. It provides high performance, high availability, and easy scalability. Its document-based structure allows for flexible and schema-less data models."
    #     }
    # ]

    # URLs to crawl
    urls_to_crawl = [
        "https://en.wikipedia.org/wiki/Jaypee_Institute_of_Information_Technology",
        "https://wiki.archlinux.org/title/Installation_guide",
        "https://www.geeksforgeeks.org/operating-systems/",
        "https://en.wikipedia.org/wiki/IIT_Kharagpur",
        "https://cloud.google.com/",
        "https://en.wikipedia.org/wiki/Cloud_computing",
        "https://www.ibm.com/topics/cloud-computing",
        "https://azure.microsoft.com/en-in/resources/cloud-computing-dictionary/what-is-computer-vision#object-classification",
        "https://www.ibm.com/topics/computer-vision",
        "https://en.wikipedia.org/wiki/Computer_vision",
        "https://cloud.google.com/learn/what-is-big-data",
        "https://en.wikipedia.org/wiki/Big_data"
    ]

    # Fetch and parse pages
    crawled_documents = []
    for url in urls_to_crawl:
        html = await fetch_page(url)
        document = await parse_page(html)
        # Check if the document already exists in the collection
        existing_document = await collection.find_one({"title": document["title"]})
        if not existing_document:
            await collection.insert_one(document)
            print("Inserted:", document["title"])
        else:
            print("Skipped (already exists):", document["title"])

    print("Crawling and appending completed!")

if __name__ == "__main__":
    asyncio.run(crawl_and_populate_db())
