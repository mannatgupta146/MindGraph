import mongoose from 'mongoose';

const saveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['article', 'tweet', 'image', 'youtube', 'pdf', 'unspecified'],
    default: 'unspecified'
  },
  tags: [{
    type: String
  }],
  url: {
    type: String
  },
  summary: {
    type: String
  },
  embedding: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

const Save = mongoose.model('Save', saveSchema);

export default Save;
