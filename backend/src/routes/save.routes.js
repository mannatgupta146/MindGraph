import express from 'express';
import multer from 'multer';
import { createSave, getSaves, semanticSearch, deleteSave, getGraphData } from '../controllers/save.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post('/', upload.single('file'), createSave);
router.get('/', getSaves);
router.get('/graph', getGraphData);
router.get('/search', semanticSearch);
router.delete('/:id', deleteSave);

export default router;
