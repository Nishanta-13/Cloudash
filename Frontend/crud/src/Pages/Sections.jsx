import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SectionsPage = () => {
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    
    const fetchSections = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5050/api/section');
        if (Array.isArray(res.data)) {
          setSections(res.data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch sections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Safe filtering of sections
  const filteredSections = Array.isArray(sections) 
    ? sections.filter(section =>
        section?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ): [];

  // Add new section with validation
  const addSection = async () => {
    if (!newSectionName.trim()) return;
    
    try {
      await axios.post('http://localhost:5050/api/section', { name: newSectionName });
      setNewSectionName('');
      // Re-fetch to ensure we have the latest data
      const res = await axios.get('http://localhost:5050/api/section');
      setSections(res.data);
    } catch (err) {
      setError('Failed to add section');
      console.error('Add section error:', err);
    }
  };

  // Delete section with confirmation
  const deleteSection = async (id) => {
    if (!window.confirm('Delete this section and all its folders?')) return;
    
    try {
      await axios.delete(`http://localhost:5050/api/section/${id}`);
      setSections(prev => prev.filter(section => section._id !== id));
    } catch (err) {
      setError('Failed to delete section');
      console.error('Delete section error:', err);
    }
  };

  // Edit section handlers
  const startEditing = (section) => {
    setEditingId(section._id);
    setEditName(section.name);
  };

  const saveEdit = async () => {
    try {
      await axios.put(`http://localhost:5050/api/section/${editingId}`, { name: editName });
      setSections(prev => prev.map(section => 
        section._id === editingId ? { ...section, name: editName } : section
      ));
      setEditingId(null);
    } catch (err) {
      setError('Failed to update section');
      console.error('Update section error:', err);
    }
  };

  // Render loading or error states
  if (loading) return <div className="p-6 text-center">Loading sections...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sections</h1>
 
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search sections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New section name"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button 
            onClick={addSection}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded transition-colors"
            disabled={!newSectionName.trim()}
            style={{ cursor: "pointer" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Sections Grid */}
      {filteredSections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No matching sections found' : 'No sections available'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSections.map((section) => (
            <div key={section._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              {editingId === section._id ? (
                <div className="flex gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border p-1 rounded"
                  />
                  <button 
                    onClick={saveEdit}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 rounded transition-colors"
                    disabled={!editName.trim()}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <h2 
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/section/${section._id}`)} 
                  >
                    {section.name}
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditing(section)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label="Edit"
                      style={{ cursor: "pointer" }}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => deleteSection(section._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Delete"
                      style={{ cursor: "pointer" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionsPage;