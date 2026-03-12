import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  folderId: { 
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId instead of String
    ref: 'Folder', // Creates a reference to Folder model
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['image', 'video'], required: true }, // Restrict to specific types
  size: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, required: true },
});

const FolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  sectionId: { 
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId instead of String
    ref: 'Section', // Creates a reference to Section model
    required: true 
  },
  color: { type: String },
});

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  date: { type: Date, default: Date.now }
});

const Section = mongoose.model('Section', SectionSchema);
const Folder = mongoose.model('Folder', FolderSchema);
const File = mongoose.model('File', FileSchema);

export { Section, Folder, File };