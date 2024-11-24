# Big Data Search Engine

A scalable search engine built with Next.js, Python (Quart), and MongoDB for handling and querying large datasets efficiently.

## 🌐 Live Demo

- Frontend: [https://search-engine-six-green.vercel.app/](https://search-engine-six-green.vercel.app/)
- Backend API: [https://search-engine-1nfx.onrender.com](https://search-engine-1nfx.onrender.com)

## 🎯 Project Overview

This project was developed as part of the Data Structures and Algorithms for Big Data course at Jaypee Institute of Information Technology. It demonstrates the practical application of advanced data structures and algorithms in handling large-scale data processing and retrieval.

### Key Features

- 🔍 Efficient text-based searching
- 📊 TF-IDF based relevance scoring
- ⚡ Async processing for improved performance
- 🎨 Clean, modern UI with dark mode support
- 📱 Responsive design for all devices

## 🛠️ Technology Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- shadcn/ui components

### Backend
- Python (Quart Framework)
- NLTK for text processing
- Motor for async MongoDB operations
- TF-IDF vectorization

### Database
- MongoDB with text indexing

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/coder-Harshit/search_engine.git
   cd search_engine
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create `.env` files in both frontend and backend directories with the necessary configurations.

5. Run the development servers:
   
   Frontend:
   ```bash
   npm run dev
   ```

   Backend:
   ```bash
   hypercorn backend/main:app
   ```

## 📚 Course Context

This project is part of the Data Structures & Algorithms for Big Data (17M11CS111) course at JIIT, which covers:

- Big Data characteristics and applications
- Parallel algorithms and data structures
- Indexing strategies and Big Data databases
- MapReduce programming model
- Hashing and membership algorithms
- Cardinality and frequency estimation

## 👥 Team Members

- Madhura Jituri (21803004)
- Anmol Verma (21803014)
- Harshit Vijay (21803015)
- Rohit Gupta (21803018)
- Vibhav Baba (21803027)

## 🎓 Academic Context

- **Course**: Data Structures & Algorithms for Big Data
- **Course Code**: 17M11CS111
- **Institution**: Jaypee Institute of Information Technology
- **Instructor**: Dr. Shikha Jain

## 📄 License

This project is academic work and is subject to university guidelines.

## 🙏 Acknowledgments

Special thanks to Dr. Shikha Jain for her guidance and support throughout the development of this project.