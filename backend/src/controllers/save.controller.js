import fs from 'fs';
import Save from '../models/save.model.js';
import { generateEmbedding, generateAISummary, generateAITags } from '../services/ai.service.js';
import { PDFParse } from 'pdf-parse';

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
        const dataBuffer = fs.readFileSync(req.file.path);
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        content = result.text || 'No text content extracted from PDF';
        await parser.destroy();
        
        if (!title) {
          title = content.split('\n')[0].substring(0, 50).trim() || req.file.originalname;
        }
        type = 'pdf';
      } else if (isImage) {
        if (!content) content = `Visual artifact: ${req.file.originalname}`;
        if (!title) title = req.file.originalname;
        type = 'image';
      }
      
      fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    if (!content) {
      return res.status(400).json({ message: 'Content or PDF file is required' });
    }

    // 1. Generate AI enhancements
    const embedding = await generateEmbedding(content);
    const summary = await generateAISummary(content);
    const aiTags = await generateAITags(content);

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
      embedding,
      fileUrl
    });

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

    const queryEmbedding = await generateEmbedding(query);
    const saves = await Save.find({ user: userId })
      .select('title content summary type tags embedding createdAt')
      .lean();

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    // Calculate hybrid scores
    const scoredResults = saves
      .map(save => {
        // 1. Semantic Score (0 to 1)
        const semanticScore = (save.embedding && save.embedding.length === 384) 
          ? cosineSimilarity(queryEmbedding, save.embedding) 
          : 0;
        
        // 2. Word-Level Match Score (0 to 1)
        const titleText = (save.title || '').toLowerCase();
        const contentText = (save.content || '').toLowerCase();
        const tagsText = (save.tags || []).join(' ').toLowerCase();
        
        let matchingWordsCount = 0;
        queryWords.forEach(word => {
          // Check for partial/singular/plural matches
          if (titleText.includes(word) || contentText.includes(word) || tagsText.includes(word)) {
            matchingWordsCount++;
          }
        });

        const wordMatchScore = queryWords.length > 0 ? (matchingWordsCount / queryWords.length) : 0;
        const literalScore = wordMatchScore > 0 ? (0.6 + (wordMatchScore * 0.4)) : 0; // Boost any match to at least 0.6

        // 3. Final Combined Score (Take the best signal)
        const score = Math.max(semanticScore, literalScore);
        
        return { ...save, score };
      })
      .filter(save => save.score > 0.25) // Broad capture for hybrid ranking
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    console.log(`[HYBRID SEARCH] Query: "${query}" | Words: ${queryWords.length} | Matches: ${scoredResults.length} | Max Score: ${scoredResults[0]?.score?.toFixed(4) || 0}`);

    // Remove content from response to keep it light
    const finalResults = scoredResults.map(({ content, embedding, ...rest }) => rest);

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
