import Collection from '../models/collection.model.js';
import Save from '../models/save.model.js';

export const createCollection = async (req, res) => {
  try {
    const { title, description, icon, color } = req.body;
    const userId = req.user.id;

    const collection = await Collection.create({
      user: userId,
      title,
      description,
      icon,
      color
    });

    res.status(201).json(collection);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Collection with this title already exists' });
    }
    res.status(500).json({ message: 'Error creating collection' });
  }
};

export const getCollections = async (req, res) => {
  try {
    const userId = req.user.id;
    const collections = await Collection.find({ user: userId })
      .populate('saves', 'title type tags createdAt')
      .sort({ updatedAt: -1 });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collections' });
  }
};

export const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const collection = await Collection.findOne({ _id: id, user: userId })
      .populate('saves');

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collection detail' });
  }
};

export const addSaveToCollection = async (req, res) => {
  try {
    const { collectionId, saveId } = req.body;
    const userId = req.user.id;

    // Verify ownership of both
    const collection = await Collection.findOne({ _id: collectionId, user: userId });
    const save = await Save.findOne({ _id: saveId, user: userId });

    if (!collection || !save) {
      return res.status(404).json({ message: 'Collection or Memory not found' });
    }

    // Add if not already present
    if (!collection.saves.includes(saveId)) {
      collection.saves.push(saveId);
      await collection.save();
    }

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error adding memory to collection' });
  }
};

export const removeSaveFromCollection = async (req, res) => {
  try {
    const { collectionId, saveId } = req.body;
    const userId = req.user.id;

    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: userId },
      { $pull: { saves: saveId } },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error removing memory from collection' });
  }
};

export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const collection = await Collection.findOneAndDelete({ _id: id, user: userId });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json({ message: 'Collection deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting collection' });
  }
};
