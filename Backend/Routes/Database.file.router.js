import express from 'express';
import { File } from '../model/Database.model.js';
import { cloudinary } from '../config/cloudinary.config.js';

import fs from 'fs'; // Import fs for file system operations
import sharp from 'sharp'; // Import sharp for image processing
import ffmpeg from 'fluent-ffmpeg'; // Import fluent-ffmpeg for video processing
import path from 'path'; // Import path for file path operations
import { Upload } from '../middleware/upload.middleware.js';


const fileRouter = express.Router();

fileRouter.post('/file', Upload.single('file'), async (req, res) => {
  const file = req.file;
  const { folderId, title, description } = req.body;
  try {
    let result;
    let thumbnailResult;
    const timestamp = Date.now();
    if (file.mimetype.startsWith('image/')) {
      const thumbnailBuffer = await sharp(file.buffer)
        .resize({ width: 300, height: 300, fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
      thumbnailResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'gallery/thumbnail' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result)
          }
        ).end(thumbnailBuffer);
      });
      // compress image
      const imageBuffer = await sharp(file.buffer)
        .resize({ width: 1920, height: 1080, fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'gallery/images' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        ).end(imageBuffer);
      });
    }

    else if (file.mimetype.startsWith('video/')) {

      const inputPath = path.join('uploads', `${timestamp}-input.mp4`);
      const outputPath = path.join('uploads', `${timestamp}-output.mp4`);
      const thumbnailPath = path.join('uploads', `${timestamp}-thumb.jpg`);

      fs.writeFileSync(inputPath, file.buffer); // Save the uploaded video

      // Generate a thumbnail using ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .on('end', resolve)
          .on('error', reject)
          .screenshots({
            timestamps: ['50%'],
            filename: path.basename(thumbnailPath),
            folder: 'uploads',
            size: '300x300',
          });
      });

      thumbnailResult = await cloudinary.uploader.upload(thumbnailPath, {
        folder: 'gallery/thumbnails'
      });
      fs.unlinkSync(thumbnailPath);
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions('-c:v', 'libx264')
          .outputOptions('-preset', 'fast')
          .outputOptions('-crf', '28')
          .size('1280x720')
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });

      result = await cloudinary.uploader.upload(outputPath, {
        resource_type: 'video',
        folder: 'gallery/videos'
      });

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    }
    else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
    const fileDoc = new File({
      title,
      description,
      folderId,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      cloudinaryId: result.public_id,
      url: result.secure_url,
      thumbnail: thumbnailResult.secure_url,
       size: file.size,
    });
    await fileDoc.save();// Save file metadata to the database


    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileDoc,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'File upload failed', error: error.message });


  }
});

fileRouter.get('/file', async (req, res) => {
  try {
    const { folderId, type } = req.query;
    const query = {};
    if (folderId) query.folderId = folderId;
    if (type) query.type = type;
    const files = await File.find(query).sort({ date: -1 });
    res.status(200).json(files);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
});

fileRouter.route('/file/:id')
  .put(async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    try {
      const updatedFile = await File.findByIdAndUpdate(
        id,
        { title, description },
        { new: true, runValidators: true }
      );

      if (!updatedFile) {
        return res.status(404).json({ message: 'File not found' });
      }

      res.status(200).json({ message: 'File updated successfully', file: updatedFile });
    } catch (error) {
      res.status(500).json({ message: 'File update failed', error: error.message });
    }
  })
  .delete(async (req, res) => {
    const { id } = req.params;

    try {
      const file = await File.findById(id);
      if (!file) return res.status(404).json({ message: 'File not found' });

      if (file.cloudinaryId) {
        await cloudinary.uploader.destroy(file.cloudinaryId, {
          resource_type: file.type === 'video' ? 'video' : 'image'
        });
      }

      await file.deleteOne();
      res.status(200).json({ message: 'File deleted successfully', deletedId: id });
    } catch (error) {
      res.status(500).json({ message: 'File deletion failed', error: error.message });
    }
  });

fileRouter.post('/debug', Upload.single('file'), (req, res) => {
  res.json({ headers: req.headers, body: req.body, file: req.file, files: req.files });
});

export default fileRouter;
