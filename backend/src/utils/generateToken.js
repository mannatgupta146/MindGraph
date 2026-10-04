import jwt from 'jsonwebtoken';

const generateToken = (res, userId, returnToken = false) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true, // Required for SameSite: none
    sameSite: 'none', // Allow cross-site cookies between Vercel and Render
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  if (returnToken) return token;
};

export default generateToken;
