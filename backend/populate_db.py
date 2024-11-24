from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import re
from dotenv import load_dotenv
from pymongo.server_api import ServerApi
import os

load_dotenv(dotenv_path='.env.local')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
uri = f"mongodb+srv://{DB_USER}:{DB_PASSWORD}@cluster0.ncedv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

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

async def connect_to_db():
    client = AsyncIOMotorClient(uri, server_api=ServerApi('1'))
    try:
        await client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
        return client
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return None

async def crawl_and_populate_db(client):
    if client is None:
        print("No database connection. Exiting.")
        return

    db = client.search_engine
    collection = db.documents

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

    for url in urls_to_crawl:
        try:
            html = await fetch_page(url)
            document = await parse_page(html)
            # Check if the document already exists in the collection
            existing_document = await collection.find_one({"title": document["title"]})
            if not existing_document:
                await collection.insert_one(document)
                print("Inserted:", document["title"])
            else:
                print("Skipped (already exists):", document["title"])
        except Exception as e:
            print(f"Error processing {url}: {e}")

    print("Crawling and appending completed!")

async def main():
    client = await connect_to_db()
    await crawl_and_populate_db(client)

if __name__ == "__main__":
    asyncio.run(main())
