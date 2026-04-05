import express from 'express';
import multer from 'multer';
import { createSave, getSaves, getSaveById, semanticSearch, deleteSave, getGraphData, getInbox, getArchivedSaves, updateSave, getResurfacedMemories } from '../controllers/save.controller.js';


import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Professional Memory Storage for Production-Readiness
// We process files in-memory to keep the server clean and cloud-compatible.
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});


router.use(protect);

router.post('/', upload.single('file'), createSave);
router.post('/save', upload.single('file'), createSave);
router.get('/', getSaves);
router.get('/inbox', getInbox);
router.get('/archived', getArchivedSaves);

router.get('/graph', getGraphData);
router.get('/search', semanticSearch);
router.get('/resurface', getResurfacedMemories);
router.get('/:id', getSaveById);
router.patch('/:id', updateSave);

router.delete('/:id', deleteSave);

export default router;
