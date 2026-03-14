import express from 'express';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile);

export default router;
