import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Save from '../models/save.model.js';
import { generateAISummary, generateAITags, generateMistralEmbedding, generateResurfaceSynthesis } from '../services/ai.service.js';
import * as pineconeService from '../services/pinecone.service.js';
import pdf from 'pdf-parse-fork';
import ytdl from '@distube/ytdl-core';



const { getSubtitles } = require('youtube-captions-scraper');


export const createSave = async (req, res) => {
  try {
    let { title, content, type, url, source, domain, imageUrl, pdfUrl, tags: userTags } = req.body;
    const userId = req.user.id;

    // 1. Atomic Duplicate Handling: If URL exists for this user, we perform a 'Neural Update'
    if (url) {
      const existingSave = await Save.findOne({ url, user: userId });
      if (existingSave) {
        console.log(`[Neural Update] Refreshing metadata for: ${url}`);
        existingSave.title = title || existingSave.title;
        existingSave.content = content || existingSave.content;
        existingSave.type = type || existingSave.type;
        existingSave.source = source || existingSave.source;
        existingSave.domain = domain || existingSave.domain;
        existingSave.imageUrl = imageUrl || existingSave.imageUrl;
        existingSave.pdfUrl = pdfUrl || existingSave.pdfUrl;
        
        // Re-trigger AI for updated content
        if (content && content !== existingSave.content) {
          const summary = await generateAISummary(content);
          const aiTags = await generateAITags(content);
          const embedding = await generateMistralEmbedding(content);
          existingSave.summary = summary;
          existingSave.tags = [...new Set([...(userTags || []), ...aiTags])];
          existingSave.embedding = embedding;
          await pineconeService.upsertMemoryToPinecone(existingSave._id.toString(), content, { user: userId.toString() });
        }
        
        await existingSave.save();
        return res.status(200).json(existingSave);
      }
    }

    let fileUrl = null;

    // Handle File upload (PDF/Image) - Legacy Support for Dashboard
    if (req.file) {
      const isPDF = req.file.mimetype === 'application/pdf';
      const isImage = req.file.mimetype.startsWith('image/');

      if (isPDF) {
        try {
          const dataBuffer = req.file.buffer;
          const data = await pdf(dataBuffer);
          content = data.text || 'No text content extracted from PDF';
          if (!title) title = content.split('\n')[0].substring(0, 50).trim() || req.file.originalname;
          type = 'pdf';
        } catch (pdfError) {
          return res.status(400).json({ message: 'Failed to process PDF file' });
        }
      } else if (isImage) {
        try {
          const Tesseract = await import('tesseract.js');
          const { data: { text } } = await Tesseract.default.recognize(req.file.buffer, 'eng');
          content = text.trim() ? text.trim() : `Visual artifact indexed: ${req.file.originalname}`;
          if (!title) title = req.file.originalname;
          type = 'image';
        } catch (ocrError) {
          content = `Visual artifact indexed (OCR Failed): ${req.file.originalname}`;
          if (!title) title = req.file.originalname;
          type = 'image';
        }
        fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    // Handle extraction only if content is missing (Smart Fallback)
    if (!content && url) {
      if (type === 'youtube') {
        try {
          const info = await ytdl.getBasicInfo(url);
          if (!title) title = info.videoDetails.title;
          let transcriptText = '';
          try {
            const videoID = ytdl.getVideoID(url);
            const captions = await getSubtitles({ videoID, lang: 'en' });
            transcriptText = captions.map(c => c.text).join(' ');
          } catch (tError) { console.warn('Transcript unavailable'); }
          content = `Video: ${info.videoDetails.title}\n\nTranscript: ${transcriptText || 'N/A'}`;
        } catch (yError) { console.error('YT Error'); }
      } else if (type === 'tweet') {
        try {
          const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
          const response = await fetch(oembedUrl);
          const data = await response.json();
          if (!title) title = `Tweet by ${data.author_name}`;
          content = data.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        } catch (tError) { console.error('Tweet Error'); }
      }
    }

    if (!content) content = `Neural Link established: ${url || title}`;

    // Generate AI enhancements
    const summary = await generateAISummary(content);
    const aiTags = await generateAITags(content);
    const embedding = await generateMistralEmbedding(content);
    const combinedTags = [...new Set([...(userTags || []), ...aiTags])];

    const newSave = await Save.create({
      user: userId,
      title,
      content,
      type,
      url,
      source: source || 'Chrome',
      domain,
      imageUrl,
      pdfUrl,
      tags: combinedTags,
      summary,
      embedding, 
      fileUrl
    });

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
    // Dashboard shows all active (non-archived) memories for easy discovery
    const saves = await Save.find({ user: userId, status: { $ne: 'archived' } }).sort({ createdAt: -1 });
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

export const getArchivedSaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const saves = await Save.find({ user: userId, status: 'archived' }).sort({ createdAt: -1 });
    res.json(saves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching archived saves' });
  }
};

export const getGraphData = async (req, res) => {

  try {
    const userId = req.user.id;
    // Show all active knowledge (both inbox and processed) so the graph is immediately visible
    const saves = await Save.find({ user: userId, status: { $ne: 'archived' } }).select('title type tags embedding createdAt');


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
            type: 'tag',
            sim: 0.95 // Very high theoretical similarity for shared tags
          });
        } 
        // Option 2: Semantic Similarity (AI Hidden Link via Vectors)
        else if (saves[i].embedding?.length > 0 && saves[j].embedding?.length > 0) {
          const sim = cosineSimilarity(saves[i].embedding, saves[j].embedding);
          if (sim > 0.55) { // Lower threshold creates a broader web for D3 graph physics to handle
            links.push({
              source: saves[i]._id,
              target: saves[j]._id,
              value: Math.pow(sim, 2) * 5,
              type: 'semantic',
              sim: sim // Pass exact vector cosine similarity back
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

export const getResurfacedMemories = async (req, res) => {
  try {
    const userId = req.user.id;

    // We use MongoDB aggregation to efficiently grab 3 RANDOM memories that are currently active in the graph
    const randomMemories = await Save.aggregate([
      { $match: { user: userId, status: { $ne: 'archived' } } },
      { $sample: { size: 3 } }
    ]);

    if (randomMemories.length === 0) {
      return res.json({ memories: [], synthesis: "You have no memories in your graph yet." });
    }

    // Pass the random selections to Mistral AI to draw a connective line
    const synthesis = await generateResurfaceSynthesis(randomMemories);

    res.json({
      memories: randomMemories,
      synthesis
    });
  } catch (error) {
    console.error('Resurface retrieval error:', error);
    res.status(500).json({ message: 'Error generating resurface content' });
  }
};
