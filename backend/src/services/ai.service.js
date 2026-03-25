import { pipeline } from '@xenova/transformers';

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
    // Return an empty array or a zero vector if it fails, though it shouldn't locally
    return new Array(384).fill(0); 
  }
};

/**
 * Basic extraction-based summarizer for free tier.
 * Extracts the first few meaningful sentences.
 */
export const generateAISummary = async (content) => {
  if (!content) return "";
  
  // Simple heuristic: Take the first 3 sentences or first 200 characters
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10).map(s => s.trim());
  const summary = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
  
  return summary || content.substring(0, 150) + "...";
};

/**
 * Basic keyword-based tagger for free tier.
 * Extracts common tech/topic keywords found in the text.
 */
export const generateAITags = async (content) => {
  if (!content) return [];
  
  const commonTopics = [
    'AI', 'Machine Learning', 'Productivity', 'Design', 'Development', 
    'React', 'Node', 'Database', 'Search', 'Psychology', 'Neuroscience',
    'Finance', 'Health', 'Tech', 'Startup', 'Writing', 'Code'
  ];
  
  const foundTags = commonTopics.filter(topic => 
    content.toLowerCase().includes(topic.toLowerCase())
  );
  
  // Take up to 5 tags, or add 'General' if none found
  return foundTags.slice(0, 5).length > 0 ? foundTags.slice(0, 5) : ['General'];
};
