import { pipeline } from '@xenova/transformers';
import { MistralAIEmbeddings, ChatMistralAI } from "@langchain/mistralai";
import dotenv from 'dotenv';


dotenv.config();


// Configuration for local models
let extractor = null;

const getExtractor = async () => {
  if (!extractor) {
    // all-MiniLM-L6-v2 is a small, fast, and high-quality embedding model (~45MB)
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
};

export const generateEmbedding = async (text) => {
  try {
    const extract = await getExtractor();
    const output = await extract(text, { pooling: 'mean', normalize: true });
    
    // Convert tensor to regular array
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating local embedding:', error);
    // Return an empty array or a zero vector if it fails
    return new Array(384).fill(0); 
  }
};

export const generateMistralEmbedding = async (text) => {
  try {
    const embeddings = new MistralAIEmbeddings({
      apiKey: process.env.MISTRAL_API_KEY,
      model: "mistral-embed",
    });
    const [embedding] = await embeddings.embedDocuments([text]);
    return embedding;
  } catch (error) {
    console.error('Error generating Mistral embedding:', error);
    return [];
  }
};


/**
 * Real AI extraction using Mistral.
 * Returns a high-quality summary of the content.
 */
export const generateAISummary = async (content) => {
  if (!content) return "";
  
  try {
    const model = new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0,
    });

    const response = await model.invoke([
      ["system", "You are a specialized AI that summarizes digital captures. Generate a concise 1-2 sentence summary of this content that captures its core value and context."],
      ["user", `Content to summarize: ${content.substring(0, 4000)}`]
    ]);

    return response.content.trim();
  } catch (error) {
    console.error('Error generating AI summary:', error);
    // Fallback: Simple extraction
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10).map(s => s.trim());
    return sentences.slice(0, 3).join('. ') + "...";
  }
};

/**
 * Real AI Semantic Tagger.
 * Extracts 3-5 relevant semantic tags from the content.
 */
export const generateAITags = async (content) => {
  if (!content) return [];
  
  try {
    const model = new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0,
    });

    const response = await model.invoke([
      ["system", "You are a specialized AI that extracts semantic tags. Extract 3-5 high-quality tags from this text. You MUST include at least one of these primary broad categories if remotely applicable: Technology, Politics, Science, Business, Health, Arts, History, Philosophy, Entertainment. Return only the tags as a comma-separated list. No preamble, no periods, no numbering."],
      ["user", `Content to tag: ${content.substring(0, 4000)}`]
    ]);

    const tags = response.content.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    return tags.length > 0 ? tags.slice(0, 5) : ['General'];
  } catch (error) {
    console.error('Error generating AI tags:', error);
    // Fallback: Basic keyword matching
    const commonTopics = [
      'Technology', 'Politics', 'Science', 'Business', 'Health', 'Arts', 'History', 'Philosophy', 'Entertainment',
      'AI', 'Machine Learning', 'Productivity', 'Design', 'Development', 
      'Database', 'Psychology', 'Neuroscience', 'Finance', 'Startup'
    ];
    const foundTags = commonTopics.filter(topic => content.toLowerCase().includes(topic.toLowerCase()));
    return foundTags.slice(0, 5).length > 0 ? foundTags.slice(0, 5) : ['General'];
  }
};

