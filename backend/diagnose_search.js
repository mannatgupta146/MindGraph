import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateEmbedding } from './src/services/ai.service.js';
import Save from './src/models/save.model.js';

dotenv.config();

const diagnose = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const query = 'reporting';
    console.log(`Generating embedding for: "${query}"...`);
    const embedding = await generateEmbedding(query);
    console.log('Embedding generated. Dimensions:', embedding.length);

    console.log('Running Vector Search on "vector_index"...');
    const results = await Save.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 100,
          limit: 10
        }
      },
      {
        $project: {
          title: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    console.log('Results:', JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('DIAGNOSTIC ERROR:', error);
  } finally {
    await mongoose.disconnect();
  }
};

diagnose();
