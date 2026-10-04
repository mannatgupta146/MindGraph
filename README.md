# MindGraph: Smart Personal Knowledge Workspace

**MindGraph** is a full-stack personal knowledge workspace and second brain. It solves the issue of information overload by allowing you to easily save, organize, OCR-extract, and visually connect articles, notes, PDFs, tweets, videos, and images in one clean interface.

---

## Table of Contents

- [Features](#features)
- [Workspace Sections](#workspace-sections)
- [Browser Extension](#browser-extension)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Deployment & Environment](#deployment--environment)
- [Contributing](#contributing)

---

## Features

- **Multi-Format Support**: Save articles, PDFs, tweets, YouTube videos, images, and text notes.
- **Universal AI Document Parsing**: OCR text extraction cleans raw document scans, receipts, and ID cards into structured Markdown.
- **Hybrid Semantic & Keyword Search**: Combines Pinecone vector embeddings with MongoDB text matching for accurate conceptual search.
- **Interactive Knowledge Graph**: 2D force-directed canvas displaying connections between your saved items and topics.
- **0ms Render Latency**: Client-side state caching via Zustand ensures instant page navigation.

---

## Workspace Sections

- **Dashboard**: Overview of active saved items, categories, and recent content.
- **Inbox**: Unprocessed queue for review and organization into collections.
- **Archives**: Safe storage for archived items without cluttering your active workspace.
- **Search & Discover**: Smart search with suggestion chips, type filters, and match ranking.
- **Collections**: Custom folders with personalized icons, accent colors, and descriptions.
- **Knowledge Graph**: Interactive 2D visualization linking saved content by common tags and topics.

---

## Browser Extension

The **MindGraph Chrome Extension** allows 1-click capture directly from your active browser tab.

### Setup & Sync
1. Click **Get Sync Code** in the sidebar to generate a 6-digit PIN.
2. Enter the PIN into the Chrome Extension popup to pair your account securely.

### Capture Modes
- **Auto Capture**: Scrapes current page title, URL, and metadata with 1 click.
- **Link Mode**: Submit any custom web link directly.
- **File Mode**: Upload local PDFs and images directly to your workspace.

---

## Getting Started & Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB database (local or MongoDB Atlas)
- Pinecone & Mistral API keys (for AI embeddings and search)

### 1. Clone the Repository
```bash
git clone https://github.com/mannatgupta146/MindGraph.git
cd MindGraph
```

### 2. Backend Setup
```bash
cd backend
npm install --legacy-peer-deps
# Create a .env file with MONGO_URI, JWT_SECRET, MISTRAL_API_KEY, PINECONE_API_KEY
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Chrome Extension
Import the `extension/` folder into `chrome://extensions` using **Load unpacked**.

---

## Tech Stack & Architecture

| Component | Stack |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS v4, Zustand (Persist), ForceGraph2D |
| **Backend** | Node.js, Express.js, MongoDB Atlas (Mongoose), Tesseract OCR |
| **AI & Search** | LangChain, Mistral AI Embeddings, Pinecone Vector DB, Gemini |
| **Extension** | Chrome Extension Manifest V3 |

---

## Deployment & Environment

- **Backend**: Deployed on Render with configured `/health` & `/api/health` endpoints.
- **Frontend**: Deployed on Vercel / Render.
- **Environment Variables**:
  - `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `PINECONE_API_KEY`, `MISTRAL_API_KEY`, `GEMINI_API_KEY`.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help refine and improve MindGraph.

```bash
git checkout -b feature/your-feature-name
git commit -m "Add feature description"
git push origin feature/your-feature-name
```
