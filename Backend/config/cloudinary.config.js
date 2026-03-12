import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables first!
dotenv.config();

// Verify environment variables are loaded
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '***loaded***' : 'MISSING');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export { cloudinary };