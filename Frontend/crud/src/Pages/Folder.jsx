import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const FoldersPage = () => {
  const { sectionId } = useParams();
  const [folders, setFolders] = useState([]);
  const [section, setSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [sectionRes, foldersRes] = await Promise.all([
        axios.get(`http://localhost:5050/api/section/${sectionId}`),
        axios.get(`http://localhost:5050/api/folder?sectionId=${sectionId}`)
      ]);
      setSection(sectionRes.data);
      setFolders(foldersRes.data);
    } catch (err) {
      console.error('Error fetching section or folders:', err);
    }
  };

  useEffect(() => {
    if (!sectionId) return;
    fetchData();
  }, [sectionId]);

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await axios.post('http://localhost:5050/api/folder', {
        name: newFolderName,
        sectionId
      });
      setNewFolderName('');
      fetchData();
    } catch (error) {
      console.error('Failed to add folder:', error.response?.data || error.message);
    }
  };

  const deleteFolder = async (id) => {
    if (window.confirm('Delete this folder and all its files?')) {
      await axios.delete(`http://localhost:5050/api/folder/${id}`);
      fetchData();
    }
  };

  const saveEdit = async () => {
    await axios.put(`http://localhost:5050/api/folder/${editingId}`, { name: editName });
    setEditingId(null);
    fetchData();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center text-blue-500"
      >
        ← Back to Sections
      </button>

      <h1 className="text-2xl font-bold mb-2">{section?.name}</h1>
      <p className="text-gray-500 mb-6">Folders</p>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search folders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={addFolder}
            className="bg-blue-500 text-white px-4 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredFolders.map((folder) => (
          <div key={folder._id} className="border rounded-lg p-4 shadow-sm">
            {editingId === folder._id ? (
              <div className="flex gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 border p-1"
                />
                <button
                  onClick={saveEdit}
                  className="bg-green-500 text-white px-2 rounded"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex justify-between">
                <h2
                  className="font-medium cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`/folder/${folder._id}`)}
                >
                  {folder.name}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(folder._id);
                      setEditName(folder.name);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteFolder(folder._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoldersPage;
