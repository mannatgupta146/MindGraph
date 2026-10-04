import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Save from '../models/save.model.js';
import { generateAISummary, generateAITags, generateMistralEmbedding, structureAndCleanContent } from '../services/ai.service.js';
import * as pineconeService from '../services/pinecone.service.js';
import pdf from 'pdf-parse-fork';
import ytdl from '@distube/ytdl-core';



const { getSubtitles } = require('youtube-captions-scraper');


import Tesseract from 'tesseract.js';

const withTimeout = (promise, ms, fallbackValue) => {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

export const createSave = async (req, res) => {
  try {
    let { title, content, type, url, source, domain, imageUrl, pdfUrl, tags: userTags } = req.body;
    const userId = req.user.id;

    // Robust ID Parsing Utility
    const getYoutubeID = (url) => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    // 1. Canonical Normalization
    const ytId = getYoutubeID(url);
    if (ytId) {
      url = `https://www.youtube.com/watch?v=${ytId}`;
      type = 'youtube';
    }

    // 2. Atomic Duplicate Handling & Update Optimization
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
        
        // Parallel AI Pulse for existing artifacts
        const currentContent = existingSave.content || '';
        const isFallback = currentContent.startsWith('Neural Link established:') || 
                          currentContent.startsWith('Multimedia Artifact Captured:');
                          
        if ((content && content !== existingSave.content) || isFallback) {
          const contentToProcess = content || currentContent;
          const [summary, aiTags, embedding] = await Promise.all([
            withTimeout(generateAISummary(contentToProcess), 6000, currentContent.substring(0, 150)),
            withTimeout(generateAITags(contentToProcess), 6000, ['General']),
            withTimeout(generateMistralEmbedding(contentToProcess), 6000, [])
          ]);

          existingSave.summary = summary;
          existingSave.tags = [...new Set([...(userTags || []), ...(aiTags || [])])];
          existingSave.embedding = embedding;
          
          pineconeService.upsertMemoryToPinecone(existingSave._id.toString(), contentToProcess, { user: userId.toString() })
            .catch(err => console.warn('[Pinecone Async Update Warning]', err?.message));
        }
        
        await existingSave.save();
        return res.status(200).json(existingSave);
      }
    }

    let fileUrl = null;

    // Handle File upload (PDF/Image) - Higher Fidelity Extraction
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
          // Optimized Singleton OCR Handshake with 12s timeout
          const ocrText = await withTimeout(
            Tesseract.recognize(req.file.buffer, 'eng').then(res => res?.data?.text),
            12000,
            null
          );
          
          const extractedText = ocrText ? ocrText.trim() : '';
          const userNote = req.body.content ? req.body.content.trim() : '';

          if (extractedText && userNote) {
            content = `${userNote}\n\n### Extracted Image Text:\n${extractedText}`;
          } else if (extractedText) {
            content = extractedText;
          } else if (userNote) {
            content = userNote;
          } else {
            content = `Image Memory: ${title || req.file.originalname}\nFile: ${req.file.originalname}\nVisual artifact indexed in knowledge base.`;
          }

          if (!title) title = req.file.originalname;
          type = 'image';
        } catch (ocrError) {
          console.error('[OCR Error]', ocrError?.message || ocrError);
          content = req.body.content || `Image Memory: ${title || req.file.originalname}\nFile: ${req.file.originalname}`;
          if (!title) title = req.file.originalname;
          type = 'image';
        }
        fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    // Handle extraction for YouTube/Tweets if content is missing OR if we want to prioritize high-fidelity data
    if (url) {
      if (type === 'youtube' && ytId) {
        try {
          // Resiliency Layer 1: OEmbed for Title/Metadata (Fast & Reliable with timeout)
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
          const oembedData = await withTimeout(
            fetch(oembedUrl).then(r => r.json()),
            4000,
            {}
          );
          
          if (oembedData.title) title = oembedData.title;

          let transcriptText = '';
          let description = '';

          // Resiliency Layer 2: YTDL for detailed info & transcription
          try {
            const info = await withTimeout(ytdl.getBasicInfo(url), 4000, null);
            if (info?.videoDetails) description = info.videoDetails.description || '';
            try {
              const captions = await withTimeout(getSubtitles({ videoID: ytId, lang: 'en' }), 4000, []);
              if (Array.isArray(captions)) transcriptText = captions.map(c => c.text).join(' ');
            } catch (tError) { 
              console.warn(`[Neural Extraction] Captions unavailable for ${ytId}`); 
            }
          } catch (yError) {
            console.warn(`[Neural Extraction] YTDL failed for ${ytId}`);
          }

          content = `Video: ${title || oembedData.title || 'YouTube Video'}\nAuthor: ${oembedData.author_name || 'N/A'}\n\nTranscript: ${transcriptText || 'N/A'}\n\nDescription: ${description || 'N/A'}`;
        } catch (yError) { 
          console.error('[YT Extraction Total Failure]', yError?.message || yError); 
        }
      } else if (type === 'tweet' && !content) {
        try {
          const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
          const data = await withTimeout(fetch(oembedUrl).then(r => r.json()), 4000, {});
          if (data.author_name && !title) title = `Tweet by ${data.author_name}`;
          if (data.html) content = data.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        } catch (tError) { console.error('Tweet Error', tError?.message); }
      }
    }

    // Final Fallback: Descriptive Metadata Anchor
    if (!content) content = `Multimedia Artifact Captured: ${title || 'Unlabeled'} (Reference: ${url || 'Upload'})`;

    // AI Content Refiner & OCR Sanitizer: Clean garbled OCR text into structured Markdown key-value pairs
    if (content && (type === 'image' || type === 'pdf' || content.length > 20)) {
      const structuredContent = await withTimeout(structureAndCleanContent(content), 5000, content);
      if (structuredContent) content = structuredContent;
    }

    // AI Neural Pulse: Trigger all synthesis models in parallel with a strict 6s timeout
    const [summary, aiTags, embedding] = await Promise.all([
      withTimeout(generateAISummary(content), 6000, content.substring(0, 150) + "..."),
      withTimeout(generateAITags(content), 6000, ['General']),
      withTimeout(generateMistralEmbedding(content), 6000, [])
    ]);

    const combinedTags = [...new Set([...(userTags || []), ...(aiTags || [])])];

    const newSave = await Save.create({
      user: userId,
      title: title || 'Saved Item',
      content,
      type: type || 'note',
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

    // Background Pinecone indexing so HTTP response is instant
    pineconeService.upsertMemoryToPinecone(newSave._id.toString(), content, { user: userId.toString() })
      .catch(pErr => console.warn('[Pinecone Background Upsert Error]', pErr?.message || pErr));

    return res.status(201).json(newSave);

  } catch (error) {
    console.error('Error creating save:', error);
    return res.status(500).json({ message: 'Error processing content' });
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

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const cleanQuery = query.trim();
    const searchRegex = new RegExp(cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // 1. Vector Search via Pinecone
    let pineconeResults = [];
    try {
      pineconeResults = await pineconeService.queryPinecone(cleanQuery, userId.toString(), 20);
    } catch (pcErr) {
      console.error('[PINECONE] Search error, falling back to database keyword search:', pcErr);
    }

    // Map of saveId -> score
    const scoreMap = new Map();

    // Add vector matches with threshold >= 0.35
    pineconeResults.forEach(r => {
      if (r.saveId && r.score >= 0.35) {
        scoreMap.set(r.saveId.toString(), r.score);
      }
    });

    // 2. Lookup Collections by Name
    const matchingCollections = await Collection.find({
      user: userId,
      title: searchRegex
    }).select('_id').lean();
    const collectionIds = matchingCollections.map(c => c._id);

    // 3. MongoDB Keyword & Name Search (Title/Name, Domain, URL, Type, Summary, Content, Tags, Collection Name)
    const keywordMatches = await Save.find({
      user: userId,
      $or: [
        { title: searchRegex },
        { domain: searchRegex },
        { url: searchRegex },
        { fileUrl: searchRegex },
        { type: searchRegex },
        { tags: { $in: [searchRegex] } },
        { summary: searchRegex },
        { content: searchRegex },
        ...(collectionIds.length > 0 ? [{ collection: { $in: collectionIds } }] : [])
      ]
    }).select('_id title summary type tags createdAt content domain url fileUrl collection').lean();

    // Boost scores for name & title keyword matches
    keywordMatches.forEach(item => {
      const idStr = item._id.toString();
      const existingScore = scoreMap.get(idStr) || 0;
      
      let keywordScore = 0.65;
      
      // Exact / Regex match on Item Title / Name gives high score (0.92)
      if (item.title && searchRegex.test(item.title)) {
        keywordScore = 0.92;
      } else if (item.tags && item.tags.some(t => searchRegex.test(t))) {
        keywordScore = 0.85;
      } else if (item.domain && searchRegex.test(item.domain)) {
        keywordScore = 0.80;
      } else if (collectionIds.some(cid => cid.toString() === item.collection?.toString())) {
        keywordScore = 0.80;
      }

      // Hybrid score combining vector + name/keyword match
      const finalScore = Math.min(1.0, Math.max(existingScore, keywordScore) + (existingScore && keywordScore ? 0.1 : 0));
      scoreMap.set(idStr, finalScore);
    });

    if (scoreMap.size === 0) {
      return res.json([]);
    }

    // Hydrate all matching documents from MongoDB
    const saveIds = Array.from(scoreMap.keys());
    const saves = await Save.find({ _id: { $in: saveIds } })
      .select('title summary type tags createdAt url fileUrl content domain')
      .lean();

    const finalResults = saves.map(save => ({
      ...save,
      score: scoreMap.get(save._id.toString()) || 0.5
    })).sort((a, b) => b.score - a.score);

    console.log(`[HYBRID SEARCH] Query: "${cleanQuery}" | Vector: ${pineconeResults.length} | Name/Keyword: ${keywordMatches.length} | Total Final: ${finalResults.length}`);

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
