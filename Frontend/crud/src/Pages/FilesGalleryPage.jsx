import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5050/api/file';

const FilesGalleryPage = () => {
  
  const navigate = useNavigate();
  const { folderId } = useParams();


  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFile, setNewFile] = useState({
    title: '',
    description: '',
    file: null,
    preview: null,
    type: ''
  });




  const fileInputRef = useRef(null);
  const sliderRef = useRef(null);




  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const params = { folderId };
        if (fileTypeFilter !== 'all') params.type = fileTypeFilter;

        const res = await axios.get(API_URL, { params });
        setFiles(res.data);
      } catch (error) {
        alert(`Failed to load files: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, [folderId, fileTypeFilter]);

  // Filter files based on search term
  const filteredFiles = files.filter(file =>
    (file.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (file.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // File selection handler
  const handleFileClick = (file, index) => {
    setSelectedFile(file);
    setCurrentIndex(index);
    setEditForm({
      title: file.title,
      description: file.description || ''
    });
    setIsEditing(false);
  };

  // File operations
  const handleDelete = async (id) => {
    if (!id) {
      alert('File ID is missing');
      return;
    }
    if (window.confirm('Delete this file permanently?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setFiles(files.filter(file => file._id !== id));
        closePanel();
      } catch (error) {
        alert(`Deletion failed: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!selectedFile?._id) {
        alert('No file selected to update');
        return;
      }
      const response = await axios.put(`${API_URL}/${selectedFile._id}`, {
        title: editForm.title,
        description: editForm.description
      });
      setFiles(files.map(file =>
        file._id === selectedFile._id ? { ...file, ...response.data.file } : file
      ));
      setIsEditing(false);
      setSelectedFile(prev => ({ ...prev, ...response.data.file }));
    } catch (error) {
      alert(`Update failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // File upload
  const handleFileChange = (e) => {
    e.preventDefault();
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    // // Reject files larger than 100MB (100 * 1024 * 1024 bytes)
   

    const fileType = file.type.startsWith('video/') ? 'video' :
      file.type.startsWith('image/') ? 'image' : null;

    if (!fileType) {
      alert('Only images and videos are supported');
      return;
    }

    setNewFile({
      ...newFile,
      file,
      type: fileType,
      preview: fileType === 'image' ? URL.createObjectURL(file) : '/video-placeholder.jpg'
    });
  };


  const handleAddFile = async (e) => {

    if (!newFile.file || !newFile.title.trim()) {
      alert('Please select a file and provide a title');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', newFile.file);
      formData.append('title', newFile.title);
      formData.append('description', newFile.description || '');
      formData.append('folderId', folderId); // Ensure folderId is added

      // Debugging: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const res = await axios.post(API_URL, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setFiles([...files, res.data]);
      setShowAddModal(false);
      setNewFile({ title: '', description: '', file: null, preview: null, type: '' });
    } catch (error) {
      console.error('Upload error details:', error.response?.data);
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  // UI Helpers
  const closePanel = () => {
    setSelectedFile(null);
    setIsEditing(false);
  };

  const goToPrev = () => {
    const newIndex = (currentIndex - 1 + filteredFiles.length) % filteredFiles.length;
    handleFileClick(filteredFiles[newIndex], newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % filteredFiles.length;
    handleFileClick(filteredFiles[newIndex], newIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedFile) return;
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') closePanel();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, currentIndex]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          ← Back to Folders

        </button>
   

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="all">All</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {isLoading ? 'Uploading...' : 'Add File'}
          </button>
        </div>
      </div>

      {/* Files Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file, index) => (
            <div
              key={file._id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleFileClick(file, index)}
            >
              <div className="h-48 bg-gray-100 relative">
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt={file.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative h-full">
                    <img
                      src={file.thumbnail || '/video-placeholder.jpg'}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-60 rounded-full w-12 h-12 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {file.type === 'image' ? 'IMG' : 'VID'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{file.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{file.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {filteredFiles.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 py-8">No files found.</div>
      )}

      {/* Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-xl" ref={sliderRef}>
            <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-xl" ref={sliderRef}>
              <button
                onClick={closePanel}
                className="absolute top-4 right-4 z-10 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-2/3 bg-black flex items-center justify-center relative">
                  {selectedFile.type === 'image' ? (
                    <img
                      src={selectedFile.url}
                      alt={selectedFile.title}
                      className="max-h-screen max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full">
                      <video
                        controls
                        className="w-full h-full object-contain"
                        src={selectedFile.url}
                      />
                    </div>
                  )}
                  <button
                    onClick={goToPrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="md:w-1/3 p-6 overflow-y-auto">
                  {isEditing ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSave();
                    }}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-2">{selectedFile.title}</h2>
                      <p className="text-gray-600 mb-4 whitespace-pre-line">{selectedFile.description}</p>

                      <div className="text-sm text-gray-500 mb-6">
                        <div className="flex items-center mb-1">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(selectedFile.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          {selectedFile.type === 'image' ? 'Image' : 'Video'} File
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => selectedFile?._id && handleDelete(selectedFile._id)}
                          disabled={!selectedFile?._id}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add File Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New File</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleAddFile();
                  }}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                      <input
                        type="text"
                        value={newFile.title}
                        onChange={(e) => setNewFile({ ...newFile, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newFile.description}
                        onChange={(e) => setNewFile({ ...newFile, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        rows={3}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">File*</label>
                      <div
                        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${newFile.file ? 'border-blue-400' : 'border-gray-300'}`}
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileChange(e);
                        }}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*,video/*"
                          required
                        />
                        {newFile.file ? (
                          <div>
                            <p className="font-medium">{newFile.file.name}</p>
                            <p className="text-sm text-gray-500">{Math.round(newFile.file.size / 1024)} KB</p>
                            {newFile.preview && (
                              <img
                                src={newFile.preview}
                                alt="Preview"
                                className="mt-2 mx-auto max-h-32 object-contain"
                              />
                            )}
                          </div>
                        ) : (
                          <div>
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mt-1 text-sm text-gray-600">
                              Drag and drop files here, or click to select
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Supports: JPG, PNG, GIF, MP4 (Max: 100MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {isLoading && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                        <div className="text-xs text-center mt-1">{uploadProgress}%</div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !newFile.file || !newFile.title.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </span>
                        ) : 'Upload File'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesGalleryPage;