import mongoose from 'mongoose';
import * as aiService from '../src/services/ai.service.js';
import * as pineconeService from '../src/services/pinecone.service.js';
import Save from '../src/models/save.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mindgraph');
    console.log('✅ Connected to MongoDB.');

    const saves = await Save.find({});
    console.log(`📋 Found ${saves.length} memories to migrate.`);

    for (let i = 0; i < saves.length; i++) {
        const save = saves[i];
        console.log(`\n🔄 [${i+1}/${saves.length}] Upgrading: "${save.title}"...`);

        try {
            // 1. Generate real AI tags
            console.log('   📡 Extracting semantic tags...');
            const newTags = await aiService.generateAITags(save.content);
            
            // 2. Generate real AI summary
            console.log('   📡 Synthesizing summary...');
            const newSummary = await aiService.generateAISummary(save.content);

            // 3. Generate new Mistral embedding (1024-dim)
            console.log('   📡 Generating high-fidelity embedding...');
            const newEmbedding = await aiService.generateMistralEmbedding(save.content);

            // Update MongoDB
            save.tags = newTags;
            save.summary = newSummary;
            save.embedding = newEmbedding;
            await save.save();
            console.log('   ✅ MongoDB updated.');

            // 4. Re-index in Pinecone for semantic search
            console.log('   📡 Re-indexing in Pinecone...');
            await pineconeService.upsertMemoryToPinecone(
              save._id.toString(), 
              save.content, 
              { user: save.user.toString() }
            );
            console.log('   ✅ Pinecone synced.');

        } catch (error) {
            console.error(`   ❌ Failed to migrate "${save.title}":`, error.message);
        }
    }

    console.log('\n🌟 MIGRATION COMPLETE! All memories are now AI-superpowered.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
