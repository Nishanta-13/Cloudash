import express from 'express';
import Folder from '../model/Folder.model.js';
const router = express.Router();

router.post('/folder', async (req, res) => {// Create a new folder
    try{
        console.log('POST /folder body:', req.body);
        const {name,date,sectionId}=req.body;
        const folder = new Folder({
            name,
            date,
            sectionId
        });
        await folder.save();      // Save the folder to the database
        res.status(201).json({message: 'Folder created successfully', folder});
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({message: 'Internal server error'});   
    }
}
);
router.get('/folderdata', async (req, res) => {
    try{
        const { sectionId } = req.query; // Get sectionId from query parameters
        if (sectionId) {
            // If sectionId is provided, filter folders by sectionId
            const folders = await Folder.find({ sectionId });
            return res.status(200).json(folders);
        }
        // If no sectionId is provided, return all folders
        const folders = await Folder.find();
        res.status(200).json(folders);


    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}
);
router.put('/folder/:id',async (req, res) => {
    try{
        const { id } = req.params;
        const { name, date } = req.body;
        const updatedFolder = await Folder.findByIdAndUpdate
        (id, { name, date }, { new: true });
        if (!updatedFolder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        res.status(200).json({ message: 'Folder updated successfully', folder: updatedFolder });
    }
    catch(error){
        console.error('Error updating folder:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);  
router.delete('/folder/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const deletedFolder = await Folder.findByIdAndDelete(id);
        if (!deletedFolder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        res.status(200).json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}
);
export default router;

