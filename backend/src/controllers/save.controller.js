import Save from '../models/save.model.js';
import { generateEmbedding, generateAISummary, generateAITags } from '../services/ai.service.js';
import { PDFParse } from 'pdf-parse';

export const createSave = async (req, res) => {
  try {
    let { title, content, type, url, tags: userTags } = req.body;
    const userId = req.user.id;

    // Handle PDF file upload
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        content = result.text;
        await parser.destroy();
        
        // Use AI to generate a title if not provided
        if (!title) {
          const titlePrompt = `Generate a short, descriptive title (max 6 words) for this document content: ${content.substring(0, 500)}`;
          // For now, let's just use a snippet or implement a quick title extractor
          title = content.split('\n')[0].substring(0, 50).trim() || req.file.originalname;
        }
        type = 'pdf';
      }
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

export const getGraphData = async (req, res) => {
  try {
    const userId = req.user.id;
    const saves = await Save.find({ user: userId }).select('title type tags createdAt');

    const nodes = saves.map(save => ({
      id: save._id,
      title: save.title,
      type: save.type,
      tags: save.tags,
      val: 1 // Default size
    }));

    const links = [];
    // Create links between saves that share at least one tag
    for (let i = 0; i < saves.length; i++) {
      for (let j = i + 1; j < saves.length; j++) {
        const commonTags = saves[i].tags.filter(tag => saves[j].tags.includes(tag));
        if (commonTags.length > 0) {
          links.push({
            source: saves[i]._id,
            target: saves[j]._id,
            value: commonTags.length // Thickness based on number of shared tags
          });
        }
      }
    }

    res.json({ nodes, links });
  } catch (error) {
    console.error('Graph data error:', error);
    res.status(500).json({ message: 'Error fetching graph data' });
  }
};
