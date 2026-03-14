import app from './src/app.js'
import connectDB from './src/config/db.js';

connectDB()

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('MindGraph API is running...');
});
