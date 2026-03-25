import Save from '../models/save.model.js';
import { generateEmbedding, generateAISummary, generateAITags } from '../services/ai.service.js';

export const createSave = async (req, res) => {
  try {
    const { title, content, type, url, tags: userTags } = req.body;
    const userId = req.user.id;

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
      embedding
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

export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const queryEmbedding = await generateEmbedding(query);

    // MongoDB Atlas Vector Search Pipeline
    const results = await Save.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Name of the index in Atlas
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
          filter: { user: userId }
        }
      },
      {
        $project: {
          title: 1,
          summary: 1,
          type: 1,
          tags: 1,
          createdAt: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    res.json(results);
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};
