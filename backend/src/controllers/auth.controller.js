import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      generateToken(res, user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// @desc    Generate a 6-digit pairing PIN
// @route   POST /api/auth/generate-pin
// @access  Private
const generatePairingPin = async (req, res) => {
  try {
    // req.user is already populated by the 'protect' middleware
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });

    // Generate random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.pairingPin = pin;
    req.user.pairingPinExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    await req.user.save();
    res.status(200).json({ pin });
  } catch (error) {
    console.error('❌ Sync Code Generation Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify PIN & return token
// @route   POST /api/auth/verify-pin
// @access  Public
const verifyPairingPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN is required' });

    const user = await User.findOne({
      pairingPin: pin,
      pairingPinExpires: { $gt: Date.now() }
    });

    if (user) {
      // Clear the PIN after successful use for security
      user.pairingPin = null;
      user.pairingPinExpires = null;
      await user.save();

      // IMPORTANT: Instead of just setting a cookie, we return the token directly 
      // because the extension needs to store it in local storage.
      const token = generateToken(res, user._id, true); // Modified to return token

      res.status(200).json({
        token,
        user: { _id: user._id, name: user.name, email: user.email }
      });
    } else {
      res.status(401).json({ message: 'Invalid or expired PIN' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  generatePairingPin,
  verifyPairingPin,
};
