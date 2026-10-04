# MindGraph — Personal Knowledge Workspace & AI Second Brain

**MindGraph** is a full-stack personal knowledge management system and intelligent second brain. It helps you save, organize, search, and visually connect web content, documents, and notes in a unified workspace.

---

## Table of Contents

- [Supported Content Types](#supported-content-types)
- [Key Features & AI Pipeline](#key-features--ai-pipeline)
- [Workspace Modules](#workspace-modules)
- [Browser Extension Sync](#browser-extension-sync)
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Environment Variables](#environment-variables)
- [API Endpoint Reference](#api-endpoint-reference)
- [Contributing](#contributing)

---

## Supported Content Types

MindGraph allows you to capture and index diverse content formats seamlessly:

- **Web Articles**: Full text extraction, markdown parsing, and clean reading view.
- **Tweets & X Posts**: Social bookmarking, thread content scraping, and author metadata.
- **PDF Documents**: Full document indexing with automatic AI OCR scanning for PDFs.
- **YouTube Videos**: Video details, transcript extraction, and conceptual summaries.
- **Images & Diagrams**: AI OCR text extraction from receipts, business cards, whiteboards, and screenshots.
- **Notes & Code Snippets**: Custom markdown notes, ideas, and code snippets organized by topic.

---

## Key Features & AI Pipeline

### 1. Universal AI Document Structurer
Automatically transforms messy raw OCR text, document scans, and receipts into clean, structured Markdown key-value pairs for easy reading and searching.

### 2. Hybrid Conceptual & Keyword Search
Combines 1024-dimensional **Pinecone** vector embeddings with **MongoDB** multi-word regex matching. Scores results based on semantic similarity, title matches, tag relevance, and collection names.

### 3. Interactive 2D Knowledge Graph
An interactive 2D canvas built with `react-force-graph-2d`. Visualizes relationships between saved content, categories, and tags with real-time node filtering.

### 4. Non-Blocking Resilient Processing
Background processing pipeline guarantees 1–3s instant response times when saving items, running OCR extraction, AI summarization, and vector upserting asynchronously.

### 5. Zero-Latency State Caching
Powered by **Zustand Persist**, delivering instant client-side page transitions and offline cache availability with smooth background revalidation.

---

## Workspace Modules

- **Dashboard**: Overview of recent saves, tag categories, quick capture modal, and quick statistics.
- **Inbox**: Dedicated triage queue for reviewing, tagging, and filing newly captured items.
- **Archives**: Clean storage for completed or inactive items without cluttering active views.
- **Search & Discover**: Conceptual search hero interface with real-time score ranking.
- **Collections**: Custom folder organization with custom icons, descriptions, and color accents.
- **Knowledge Graph**: Full-screen 2D force-directed canvas with node search and detail preview drawer.

---

## Browser Extension Sync

The **MindGraph Chrome Extension (Manifest V3)** enables seamless tab capture directly from your browser.

### Features
- **1-Click Web Capture**: Scrapes title, active URL, and page metadata instantly.
- **Custom Link Mode**: Save any target link without opening the page.
- **Local File Mode**: Drag-and-drop local PDFs and images directly to your workspace.

### Secure Pairing Workflow
1. Open the sidebar in your MindGraph dashboard and click **Get Sync Code** to generate a single-use 6-digit PIN (valid for 10 minutes).
2. Enter the PIN in the Chrome Extension popup to pair your browser extension securely.

---

## Tech Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS v4, Zustand (Persist), Lucide Icons, React Markdown |
| **Visualization** | `react-force-graph-2d`, Canvas HTML5 |
| **Backend API** | Node.js, Express.js, Mongoose, JWT Authentication |
| **Database** | MongoDB Atlas, Pinecone Vector Database |
| **AI Services** | Mistral AI (Text Embeddings), Google Gemini API, Tesseract OCR |
| **Extension** | Chrome Extension Manifest V3 |

---

## Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local instance or MongoDB Atlas connection string
- **API Keys**: Mistral AI, Pinecone, and Google Gemini keys

### 1. Clone Repository
```bash
git clone https://github.com/mannatgupta146/MindGraph.git
cd MindGraph
```

### 2. Backend Setup
```bash
cd backend
npm install --legacy-peer-deps
```
Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mindgraph
JWT_SECRET=your_jwt_secret_key
MISTRAL_API_KEY=your_mistral_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=mindgraph
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```
Run the development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Chrome Extension Installation
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the `extension/` folder in the repository.

---

## Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | Yes | Backend server port (default `5000`) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for signing authentication tokens |
| `MISTRAL_API_KEY` | Yes | Mistral AI API key for 1024-d text embeddings |
| `PINECONE_API_KEY` | Yes | Pinecone Vector DB API key |
| `PINECONE_INDEX` | Yes | Pinecone index name (e.g. `mindgraph`) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI summary & OCR |
| `FRONTEND_URL` | Yes | Permitted CORS origin for frontend app |

---

## API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User account registration |
| `POST` | `/api/auth/login` | User login and JWT token issuance |
| `GET` | `/api/saves` | Fetch active saved items |
| `POST` | `/api/saves` | Add a new save (link, note, file upload) |
| `GET` | `/api/saves/search?query=` | Hybrid conceptual vector & keyword search |
| `GET` | `/api/saves/inbox` | Fetch unprocessed inbox items |
| `GET` | `/api/saves/archived` | Fetch archived items |
| `GET` | `/api/saves/graph` | Fetch nodes & edges for Knowledge Graph |
| `GET` | `/api/collections` | Fetch all user collections |
| `POST` | `/api/collections` | Create a new collection folder |
| `GET` | `/health` | Server health check endpoint |

---

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m "Add amazing feature"`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.
