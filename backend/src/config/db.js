import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/mindgraph');
    
    if (uri && uri.startsWith('mongodb+srv://')) {
      console.log(`🚀 Neural Connect: MindGraph Atlas Cluster Established (${conn.connection.host})`);
    } else {
      console.log(`⚠️ Neural Fallback: MindGraph Local Bridge Detected (${conn.connection.host})`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
