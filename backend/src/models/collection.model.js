import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Save'
  }],
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
