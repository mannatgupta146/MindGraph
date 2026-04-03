import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Save from '../models/save.model.js';
import { generateAISummary, generateAITags, generateMistralEmbedding } from '../services/ai.service.js';
import * as pineconeService from '../services/pinecone.service.js';
import pdf from 'pdf-parse-fork';
import ytdl from '@distube/ytdl-core';



const { getSubtitles } = require('youtube-captions-scraper');


export const createSave = async (req, res) => {
  try {
    let { title, content, type, url, tags: userTags } = req.body;
    const userId = req.user.id;

    let fileUrl = null;

    // Handle File upload (PDF/Image)
    if (req.file) {
      const isPDF = req.file.mimetype === 'application/pdf';
      const isImage = req.file.mimetype.startsWith('image/');

      if (isPDF) {
        try {
          const dataBuffer = fs.readFileSync(req.file.path);
          const data = await pdf(dataBuffer);
          content = data.text || 'No text content extracted from PDF';
          
          if (!title) {
            title = content.split('\n')[0].substring(0, 50).trim() || req.file.originalname;
          }
          type = 'pdf';
        } catch (pdfError) {
          console.error('PDF Parse error:', pdfError);
          return res.status(400).json({ message: 'Failed to process PDF file' });
        }
      } else if (isImage) {


        if (!content) content = `Visual artifact: ${req.file.originalname}`;
        if (!title) title = req.file.originalname;
        type = 'image';
      }
      
      fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    // Handle YouTube metadata extraction
    if (type === 'youtube' && url) {
      try {
        const info = await ytdl.getBasicInfo(url);
        const videoTitle = info.videoDetails.title;
        const videoDescription = info.videoDetails.description;
        
        if (!title) title = videoTitle;
        
        let transcriptText = '';
        try {
          // Extract Video ID properly
          const videoID = ytdl.getVideoID(url);
          const captions = await getSubtitles({
            videoID,
            lang: 'en'
          });
          transcriptText = captions.map(c => c.text).join(' ');
        } catch (tError) {
          console.warn('Transcript not available for this video:', tError.message);
        }

        content = `Video Title: ${videoTitle}\n\nDescription: ${videoDescription}\n\nTranscript: ${transcriptText || 'No transcript available'}`;
      } catch (yError) {
        console.error('YouTube extraction error:', yError.message);
        // Fallback to manual content if provided, otherwise error
        if (!content) {
          return res.status(400).json({ message: 'Failed to fetch YouTube metadata. Please provide a valid link or enter content manually.' });
        }
      }
    }

    // Handle Tweet metadata extraction
    if (type === 'tweet' && url) {
      try {
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
        const response = await fetch(oembedUrl);
        if (!response.ok) throw new Error('Failed to fetch tweet info');
        
        const data = await response.json();
        const authorName = data.author_name;
        const html = data.html; // Contains the tweet text inside <p>
        
        // Strip HTML tags to get clean text
        const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        
        if (!title) title = `Tweet by ${authorName}`;
        content = cleanText;
      } catch (tError) {
        console.error('Tweet extraction error:', tError.message);
        if (!content) {
          return res.status(400).json({ message: 'Failed to fetch tweet content. Please ensure the link is valid or enter content manually.' });
        }
      }
    }

    if (!content) {
      return res.status(400).json({ message: 'Content or PDF file is required' });
    }

    // 1. Generate AI enhancements
    const summary = await generateAISummary(content);
    const aiTags = await generateAITags(content);
    const embedding = await generateMistralEmbedding(content);

    // Combine user tags with AI tags
    const combinedTags = [...new Set([...(userTags || []), ...aiTags])];

    const newSave = await Save.create({
      user: userId,
      title,
      content,
      type,
      url,
      tags: combinedTags,
      summary,
      // Store the 1024-dim embedding for graph visualization
      embedding, 
      fileUrl
    });

    // 2. Index in Pinecone for semantic search (chunks)
    await pineconeService.upsertMemoryToPinecone(newSave._id.toString(), content, { user: userId.toString() });


    res.status(201).json(newSave);

  } catch (error) {
    console.error('Error creating save:', error);
    res.status(500).json({ message: 'Error processing content' });
  }
};

export const getSaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const saves = await Save.find({ user: userId }).sort({ createdAt: -1 });
    res.json(saves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saves' });
  }
};

export const getSaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const save = await Save.findOne({ _id: id, user: userId });
    
    if (!save) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    res.json(save);
  } catch (error) {
    console.error('Error fetching memory details:', error);
    res.status(500).json({ message: 'Error fetching memory details' });
  }
};


const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Use Pinecone for semantic search
    const pineconeResults = await pineconeService.queryPinecone(query, userId.toString(), 15);
    
    if (pineconeResults.length === 0) {
      // Fallback or empty
      return res.json([]);
    }

    // Hydrate results from MongoDB
    const saveIds = [...new Set(pineconeResults.map(r => r.saveId))];
    const saves = await Save.find({ _id: { $in: saveIds } })
      .select('title summary type tags createdAt')
      .lean();

    // Map scores back and sort
    const finalResults = saves.map(save => {
      const match = pineconeResults.find(r => r.saveId === save._id.toString());
      return { ...save, score: match ? match.score : 0 };
    }).sort((a, b) => b.score - a.score);

    console.log(`[PINECONE SEARCH] Query: "${query}" | Results: ${finalResults.length}`);

    res.json(finalResults);

  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};

export const updateSave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Remove immutable or sensitive fields
    delete updates.user;
    delete updates.embedding;

    const save = await Save.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updates },
      { new: true }
    );

    if (!save) {
      return res.status(404).json({ message: 'Save not found' });
    }

    res.json(save);
  } catch (error) {
    res.status(500).json({ message: 'Error updating memory' });
  }
};

export const deleteSave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const save = await Save.findOneAndDelete({ _id: id, user: userId });

    if (!save) {
      return res.status(404).json({ message: 'Save not found' });
    }

    // Cleanup Pinecone
    await pineconeService.deleteFromPinecone(id);

    res.json({ message: 'Memory deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting memory' });
  }
};

export const getInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    const saves = await Save.find({ user: userId, status: 'inbox' }).sort({ createdAt: -1 });
    res.json(saves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inbox' });
  }
};

export const getGraphData = async (req, res) => {
  try {
    const userId = req.user.id;
    const saves = await Save.find({ user: userId }).select('title type tags embedding createdAt');

    const nodes = saves.map(save => ({
      id: save._id,
      title: save.title,
      type: save.type,
      tags: save.tags,
      val: 1 // Default size
    }));

    const links = [];
    // Create links between saves
    for (let i = 0; i < saves.length; i++) {
      for (let j = i + 1; j < saves.length; j++) {
        // Option 1: Shared Tags (Strong Link)
        const commonTags = saves[i].tags.filter(tag => saves[j].tags.includes(tag));
        if (commonTags.length > 0) {
          links.push({
            source: saves[i]._id,
            target: saves[j]._id,
            value: commonTags.length * 2,
            type: 'tag'
          });
        } 
        // Option 2: Semantic Similarity (AI Hidden Link)
        else if (saves[i].embedding?.length > 0 && saves[j].embedding?.length > 0) {
          const sim = cosineSimilarity(saves[i].embedding, saves[j].embedding);
          if (sim > 0.82) { // Threshold for "Conceptual Link"
            links.push({
              source: saves[i]._id,
              target: saves[j]._id,
              value: sim,
              type: 'semantic'
            });
          }
        }
      }
    }

    res.json({ nodes, links });
  } catch (error) {
    console.error('Graph data error:', error);
    res.status(500).json({ message: 'Error fetching graph data' });
  }
};
