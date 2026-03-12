import { useState, useRef, useCallback } from 'react';
import './FilesUploadPage.css'; // Your styling file

const FilesUploadPage = () => {
  const [files, setFiles] = useState([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentFolder, setCurrentFolder] = useState('/Documents/');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (fileList) => {
    const validFiles = fileList.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    const filesWithPreview = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '/video-icon.png',
      title: currentTitle || file.name.split('.')[0],
      description: currentDescription,
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const handleUpload = () => {
    // Here you would typically send files to your server
    console.log('Uploading files:', files);
    alert(`${files.length} files uploaded successfully!`);
    setFiles([]);
    setCurrentTitle('');
    setCurrentDescription('');
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="files-container">
      {/* Header Section */}
      <div className="files-header">
        <h2>Upload Media Files</h2>
        <div className="breadcrumbs">
          <span>Home</span> &gt; <span>Files</span> &gt; <span className="current">Upload</span>
        </div>
      </div>

      {/* Upload Card */}
      <div className="upload-card">
        {/* Drag and Drop Zone */}
        <div 
          className={`drop-zone ${isDragging ? 'dragover' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="drop-content">
            <div className="upload-icon">📁</div>
            <p>Drag & drop images or videos here</p>
            <p className="small-text">or</p>
            <button className="primary-button">Browse Files</button>
            <p className="small-text">Supports: JPG, PNG, GIF, MP4, MOV (Max 100MB)</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            multiple 
            accept="image/*, video/*" 
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
        </div>

        {/* File Details Form */}
        <div className="file-details-form">
          <div className="form-group">
            <label htmlFor="fileTitle">Title</label>
            <input 
              type="text" 
              id="fileTitle" 
              placeholder="Enter file title"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="fileDescription">Description</label>
            <textarea 
              id="fileDescription" 
              rows="3" 
              placeholder="Enter description (optional)"
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Folder Location</label>
            <div className="folder-selector">
              <span className="current-folder">{currentFolder}</span>
              <button className="icon-button">📂</button>
            </div>
          </div>
        </div>

        {/* Preview of selected files */}
        {files.length > 0 && (
          <div className="selected-files">
            <h4>Selected Files ({files.length})</h4>
            <div className="files-grid">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-thumbnail">
                    {file.type === 'image' ? (
                      <img src={file.preview} alt={file.title} />
                    ) : (
                      <div className="video-thumbnail">
                        <img src={file.preview} alt="Video thumbnail" />
                        <div className="play-icon">▶</div>
                      </div>
                    )}
                    <span className="file-type-badge">
                      {file.type === 'image' ? 'IMG' : 'VID'}
                    </span>
                    <button 
                      className="remove-file" 
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="file-info">
                    <h4>{file.title}</h4>
                    <p>{file.file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="action-buttons">
          <button 
            className="secondary-button"
            onClick={() => {
              setFiles([]);
              setCurrentTitle('');
              setCurrentDescription('');
            }}
          >
            Cancel
          </button>
          <button 
            className="primary-button" 
            onClick={handleUpload}
            disabled={files.length === 0}
          >
            Upload Files
          </button>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div className="recent-uploads">
        <h3>Recent Uploads</h3>
        <div className="files-grid">
          {/* This would typically come from your API */}
          <div className="file-item">
            <div className="file-thumbnail">
              <img src="/sample-image.jpg" alt="Thumbnail" />
              <span className="file-type-badge">IMG</span>
            </div>
            <div className="file-info">
              <h4>Sample Image.jpg</h4>
              <p>Uploaded 2 hours ago</p>
            </div>
          </div>
          <div className="file-item">
            <div className="file-thumbnail">
              <div className="video-thumbnail">
                <img src="/video-icon.png" alt="Video thumbnail" />
                <div className="play-icon">▶</div>
              </div>
              <span className="file-type-badge">VID</span>
            </div>
            <div className="file-info">
              <h4>Sample Video.mp4</h4>
              <p>Uploaded yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesUploadPage;