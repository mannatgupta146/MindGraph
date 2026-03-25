import express from 'express';
import { createSave, getSaves, semanticSearch } from '../controllers/save.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createSave);
router.get('/', getSaves);
router.get('/search', semanticSearch);

export default router;
