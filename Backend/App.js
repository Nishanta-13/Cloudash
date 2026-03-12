import express from 'express';
import mongoose from 'mongoose';
import sectionRouter from './Routes/Database.section.router.js';
import folderRouter from './Routes/Database.folder.router.js';
import fileRouter from './Routes/Database.file.router.js';
import cors from 'cors';
import dotenv from 'dotenv';



dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Handle JSON unless it's multipart/form-data
app.use(express.json({
  type: (req) => !req.headers['content-type']?.startsWith('multipart/form-data')
}));
app.use('/api', fileRouter);
app.use('/api', sectionRouter);
app.use('/api', folderRouter);


// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err);
  });
  
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
