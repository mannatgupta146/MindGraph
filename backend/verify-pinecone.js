import * as pineconeService from './src/services/pinecone.service.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 🧪 Test Procedure:
 * 1. Generate a mock Save ID.
 * 2. Upsert it into Pinecone with some high-quality text.
 * 3. Perform a semantic query for a related concept.
 * 4. Cleanup the Pinecone vectors.
 */

async function runVerification() {
  const testId = 'test-memory-999';
  const testContent = "The future of MindGraph involves a complex intersection of AI-driven semantic search, knowledge graphs, and personal memory resurfacing. It uses Pinecone for vector storage and Mistral AI for embeddings.";
  const testUserId = 'test-user-123';

  console.log('🚀 Starting Pinecone Verification...');

  try {
    // Stage 1: Upsert
    console.log('--- Phase 1: Upserting... ---');
    const upsertResult = await pineconeService.upsertMemoryToPinecone(testId, testContent, { user: testUserId });
    
    if (upsertResult) {
      console.log('✅ Upsert successful.');
    } else {
      throw new Error('❌ Upsert failed.');
    }

    // Stage 2: Query
    console.log('--- Phase 2: Querying... ---');
    // Wait a brief moment for Pinecone index propagation if needed (usually fast)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const queryResults = await pineconeService.queryPinecone('Tell me about AI-driven search and vector storage', testUserId, 1);
    
    if (queryResults.length > 0) {
      console.log('✅ Query successful. Found result:');
      console.log(`   - Save ID: ${queryResults[0].saveId}`);
      console.log(`   - Score: ${queryResults[0].score.toFixed(4)}`);
      console.log(`   - Content Preview: "${queryResults[0].content.substring(0, 50)}..."`);
    } else {
      throw new Error('❌ Query returned no results.');
    }

    // Stage 3: Cleanup
    console.log('--- Phase 3: Cleaning up... ---');
    const deleteResult = await pineconeService.deleteFromPinecone(testId);
    if (deleteResult) {
      console.log('✅ Cleanup successful.');
    }

    console.log('\n🌟 VERIFICATION COMPLETE: ALL SYSTEMS GO!');
  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error.message);
  }
}

runVerification();
