import express from 'express';
import { Folder, File } from '../model/Database.model.js'; 


const folderRouter = express.Router();

const getRandomColor = () => {
  const colors = [
    'bg-blue-100 border-blue-400',
    'bg-green-100 border-green-400',
    'bg-purple-100 border-purple-400',
    'bg-yellow-100 border-yellow-400',
    'bg-red-100 border-red-400'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

folderRouter.post('/folder', async (req, res) => {
  try {
    const { name, sectionId } = req.body;

    if (!name || !sectionId) {
      return res.status(400).json({ message: 'Name and sectionId are required' });
    }

    const folder = new Folder({
      name,
      sectionId,
      color: getRandomColor(), 
      date: new Date()
    });

    await folder.save();
    res.status(201).json(folder);

  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// 2. Get Folders (with file counts)
folderRouter.get('/folder', async (req, res) => {
  try {
    const { sectionId } = req.query;
    if (sectionId) {
      const folders = await Folder.find({ sectionId }).lean();
        const foldersWithCounts = await Promise.all(
        folders.map(async (folder) => {
          const fileCount = await File.countDocuments({ folderId: folder._id });
          return { ...folder, fileCount };
        })    
      );

      return res.status(200).json(foldersWithCounts);
    }

    const folders = await Folder.find();
    res.status(200).json(folders);

  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


folderRouter.put('/folder/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const updatedFolder = await Folder.findByIdAndUpdate(
      id,
      { name, color },
      { new: true, runValidators: true } 
    );

    if (!updatedFolder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.status(200).json(updatedFolder);

  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. Delete Folder (with cascade file deletion)
folderRouter.delete('/folder/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the folder
    const deletedFolder = await Folder.findByIdAndDelete(id);
    if (!deletedFolder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Cascade delete files
    await File.deleteMany({ folderId: id });

    res.status(200).json({ message: 'Folder and its files deleted successfully' });

  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default folderRouter;