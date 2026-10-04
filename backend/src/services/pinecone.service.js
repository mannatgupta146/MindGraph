import { Pinecone } from '@pinecone-database/pinecone';
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from 'dotenv';

dotenv.config();

const pc = new Pinecone({ 
  apiKey: process.env.PINECONE_API_KEY 
});

const indexName = process.env.PINECONE_INDEX || 'mindgraph';
const index = pc.Index(indexName);

const embeddings = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-embed",
});


/**
 * Splits content into chunks and upserts them to Pinecone.
 * @param {string} saveId - The ID of the Save document in MongoDB.
 * @param {string} content - The text content to index.
 * @param {Object} metadata - Additional metadata (e.g., userId).
 */
export const upsertMemoryToPinecone = async (saveId, content, metadata = {}) => {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });

    const chunks = await splitter.splitText(content);
    
    if (chunks.length === 0) {
      console.log(`⚠️ No chunks created for memory ${saveId}, skipping Pinecone index.`);
      return true;
    }

    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`📡 Generating embedding for chunk ${i+1}/${chunks.length}...`);
        const [embedding] = await embeddings.embedDocuments([chunk]);
        vectors.push({
          id: `${saveId}-${i}`,
          values: embedding,
          metadata: {
            ...metadata,
            saveId,
            content: chunk,
            chunkIndex: i,
          },
        });
    }

    console.log(`⚡ Ready to upsert ${vectors.length} vectors to Pinecone...`);
    await index.upsert({ records: vectors });



    console.log(`✅ Upserted ${vectors.length} chunks to Pinecone for memory ${saveId}`);
    return true;
  } catch (error) {
    console.error('❌ Error upserting to Pinecone:', error);
    return false;
  }
};

/**
 * Queries Pinecone for relevant chunks.
 * @param {string} queryText - The search query.
 * @param {string} userId - Filter results by userId.
 * @param {number} topK - Number of results to return.
 */
export const queryPinecone = async (queryText, userId, topK = 10) => {
  try {
    const queryEmbedding = await embeddings.embedQuery(queryText);

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: {
        user: { $eq: userId } // Ensure results are filtered by user
      }
    });

    return queryResponse.matches.map(match => ({
      saveId: match.metadata.saveId,
      content: match.metadata.content,
      score: match.score,
    }));
  } catch (error) {
    console.error('❌ Error querying Pinecone:', error);
    return [];
  }
};

/**
 * Deletes all chunks associated with a specific Save ID.
 * Note: Pinecone doesn't support deleting by metadata directly in all configurations 
 * easily without fetching IDs first, unless using Namespaces or specific filters if supported.
 * We'll use the ID pattern `${saveId}-${idx}` or a fetch-then-delete approach if needed.
 */
export const deleteFromPinecone = async (saveId) => {
  try {
    // For simplicity, we assume we can delete by ID prefix or we just delete a reasonable number of chunks
    // A better way is to use a namespace per user or similar.
    // Here we'll just try to delete the first 50 possible IDs for this saveId
    const idsToDelete = Array.from({ length: 50 }, (_, i) => `${saveId}-${i}`);
    await index.deleteMany({ ids: idsToDelete });

    console.log(`✅ Deleted chunks for memory ${saveId} from Pinecone`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting from Pinecone:', error);
    return false;
  }
};
