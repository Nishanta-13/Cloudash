import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  sectionId: {
    type: String,
    required: true // This field is required to associate the folder with a section
  } 
});
const Folder = mongoose.model('Folder', folderSchema);
export default Folder;