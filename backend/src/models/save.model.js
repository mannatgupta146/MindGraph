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
  source: {
    type: String,
    default: 'Chrome'
  },
  domain: {
    type: String
  },
  tags: [{
    type: String
  }],
  url: {
    type: String
  },
  imageUrl: {
    type: String
  },
  pdfUrl: {
    type: String
  },
  summary: {
    type: String
  },
  embedding: {
    type: [Number],
    default: []
  },
  status: {
    type: String,
    enum: ['inbox', 'archived', 'processed'],
    default: 'inbox'
  },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  },
  fileUrl: {
    type: String
  },
  highlights: [{
    text: { type: String, required: true },
    note: { type: String },
    color: { type: String, default: 'rgba(59, 130, 246, 0.3)' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const Save = mongoose.model('Save', saveSchema);

export default Save;
