import express from 'express';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  generatePairingPin,
  verifyPairingPin,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/generate-pin', protect, generatePairingPin);
router.post('/verify-pin', verifyPairingPin);
router.route('/profile').get(protect, getUserProfile);

export default router;
