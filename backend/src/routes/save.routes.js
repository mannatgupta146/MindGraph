import express from 'express';
import multer from 'multer';
import { createSave, getSaves, semanticSearch, deleteSave, getGraphData, getInbox, updateSave } from '../controllers/save.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.use(protect);

router.post('/', upload.single('file'), createSave);
router.get('/', getSaves);
router.get('/inbox', getInbox);
router.get('/graph', getGraphData);
router.get('/search', semanticSearch);
router.patch('/:id', updateSave);
router.delete('/:id', deleteSave);

export default router;
