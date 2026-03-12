import express from 'express';
import { Section, Folder } from '../model/Database.model.js';

const sectionRouter = express.Router();

// Test endpoint
sectionRouter.get('/test', (req, res) => {
    res.send('Section router is working');
});


sectionRouter.post('/section', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const section = new Section({
            name,
            date: new Date() 
        });

        await section.save();
        res.status(201).json({ 
            message: 'Section created successfully', 
            section 
        });

    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
});

sectionRouter.get('/section', async (req, res) => {
    try {
        const sections = await Section.find().lean();
        const folders = await Folder.find().lean();
        
        const sectionsWithFolders = sections.map(section => ({
            ...section,
            folders: folders.filter(folder => 
                folder.sectionId && folder.sectionId.toString() === section._id.toString()
            )
        }));

        res.status(200).json(sectionsWithFolders);

    } catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update section
sectionRouter.put('/section/:sectionId', async (req, res) => {
    try {
        const { sectionId } = req.params; // <-- fix here
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedSection) {
            return res.status(404).json({ message: 'Section not found' });
        }

        res.status(200).json({
            message: 'Section updated successfully',
            section: updatedSection
        });

    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete section and its folders
sectionRouter.delete('/section/:sectionId', async (req, res) => {
    try {
        const { sectionId } = req.params; // <-- fix here

        const deletedSection = await Section.findByIdAndDelete(sectionId); // <-- fix here
        if (!deletedSection) {
            return res.status(404).json({ message: 'Section not found' });
        }

        await Folder.deleteMany({ sectionId: sectionId });

        res.status(200).json({
            message: 'Section and associated folders deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});
sectionRouter.get('/section/:id', async (req, res) => {
    console.log('Looking for section:', req.params.id);
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default sectionRouter;