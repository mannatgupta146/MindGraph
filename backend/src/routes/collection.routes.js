import express from 'express';
import { 
  createCollection, 
  getCollections, 
  getCollectionById, 
  addSaveToCollection, 
  removeSaveFromCollection, 
  deleteCollection 
} from '../controllers/collection.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createCollection);
router.get('/', getCollections);
router.get('/:id', getCollectionById);
router.delete('/:id', deleteCollection);
router.post('/add', addSaveToCollection);
router.post('/remove', removeSaveFromCollection);

export default router;
