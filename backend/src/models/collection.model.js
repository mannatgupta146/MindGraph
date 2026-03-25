import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: '📁'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Save'
  }]
}, {
  timestamps: true
});

collectionSchema.index({ user: 1, title: 1 }, { unique: true });

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
