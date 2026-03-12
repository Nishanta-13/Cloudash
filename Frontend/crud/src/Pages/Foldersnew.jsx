import { useState, useEffect } from 'react';
import { FiFolder, FiSearch, FiEdit2, FiPlus, FiTrash2, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const API_URL = 'http://localhost:5050/api';

const FolderPage = () => {
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameItem, setRenameItem] = useState({ id: null, name: '', type: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: '', sectionId: null });
  const [activeModal, setActiveModal] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  // Generate random color for folders
  const getRandomColor = () => {
    const colors = [
      'text-blue-500', 'text-green-500', 'text-purple-500',
      'text-yellow-500', 'text-red-500', 'text-indigo-500',
      'text-pink-500', 'text-teal-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Fetch all sections with folders
  const fetchSections = async () => {
    try {
      const response = await fetch(`${API_URL}/sectiondata`);
      const data = await response.json();
      // Add colors to folders if they don't have one
      const sectionsWithColors = data.map(section => ({
        ...section,
        folders: section.folders.map(folder => ({
          ...folder,
          color: folder.color || getRandomColor()
        }))
      }));
      setSections(sectionsWithColors);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Add Section or Folder
  const handleAddItem = async () => {
    try {
      if (activeModal === 'section') {
        if (!newSectionName.trim()) return;
        const now = new Date();
        await fetch(`${API_URL}/section`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: newSectionName, 
            date: now.toISOString() 
          }),
        });
        setNewSectionName('');
      } else if (activeModal === 'folder') {
        if (!newFolderName.trim() || !itemToDelete.sectionId) return;
        const now = new Date();
        await fetch(`${API_URL}/folder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: newFolderName, 
            date: now.toISOString(), 
            sectionId: itemToDelete.sectionId,
            color: getRandomColor()
          }),
        });
        setNewFolderName('');
      }
      setShowAddModal(false);
      fetchSections();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleRenameItem = async () => {
    try {
      if (!renameItem.name.trim()) return;
      if (renameItem.type === 'section') {
        await fetch(`${API_URL}/section/${renameItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: renameItem.name }),
        });
      } else if (renameItem.type === 'folder') {
        await fetch(`${API_URL}/folder/${renameItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: renameItem.name }),
        });
      }
      setShowRenameModal(false);
      setRenameItem({ id: null, name: '', type: '' });
      fetchSections();
    } catch (error) {
      console.error('Error renaming item:', error);
    }
  };

  // Delete Section or Folder
  const handleDeleteItem = async () => {
    try {
      if (itemToDelete.type === 'section') {
        await fetch(`${API_URL}/section/${itemToDelete.id}`, { method: 'DELETE' });
      } else if (itemToDelete.type === 'folder') {
        await fetch(`${API_URL}/folder/${itemToDelete.id}`, { method: 'DELETE' });
      }
      setShowDeleteModal(false);
      setItemToDelete({ id: null, type: '', sectionId: null });
      fetchSections();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Filter sections and folders based on search
const filteredSections = sections
  .filter(section => 
    section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.folders.some(folder => 
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
  .map(section => ({
    ...section,
    folders: section.folders.filter(folder =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }));
  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Folder Management</h1>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              onClick={() => {
                setActiveModal('section');
                setShowAddModal(true);
              }}
            >
              <FiPlus /> Add Section
            </button>
          </div>
        </div>

        {/* Sections and Folders */}
        {filteredSections.length > 0 ? (
          <div className="space-y-4">
            {filteredSections.map((section) => (
              <div key={section._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50">
                  <div 
                    className="flex items-center flex-1 cursor-pointer"
                    onClick={() => toggleSection(section._id)}
                  >
                    {expandedSections[section._id] ? (
                      <FiChevronDown className="text-gray-500 mr-2" />
                    ) : (
                      <FiChevronRight className="text-gray-500 mr-2" />
                    )}
                    <h2 className="font-semibold text-lg text-gray-800">{section.name}</h2>
                    <span className="ml-2 text-sm text-gray-500">
                      ({section.folders.length} {section.folders.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Add Folder"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModal('folder');
                        setItemToDelete({ sectionId: section._id, type: 'section' });
                        setShowAddModal(true);
                      }}
                    >
                      <FiPlus />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Rename Section"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameItem({ id: section._id, name: section.name, type: 'section' });
                        setShowRenameModal(true);
                      }}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Section"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete({ id: section._id, type: 'section' });
                        setShowDeleteModal(true);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {/* Folders in Section */}
                {expandedSections[section._id] !== false && section.folders.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {section.folders.map((folder) => (
                      <div 
                        key={folder._id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group relative"
                      >
                        <div className="flex items-center mb-3">
                          <FiFolder className={`${folder.color} text-3xl mr-3`} />
                          <span className="font-medium text-gray-800 truncate flex-1">{folder.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">Created: {new Date(folder.date).toLocaleDateString()}</div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Rename Folder"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameItem({ id: folder._id, name: folder.name, type: 'folder' });
                              setShowRenameModal(true);
                            }}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete Folder"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete({ id: folder._id, type: 'folder' });
                              setShowDeleteModal(true);
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FiFolder className="mx-auto text-5xl mb-2" />
            <p>No items found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div 
              className="bg-white p-6 rounded-lg shadow-xl w-80 transform transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">
                {activeModal === 'folder' ? 'Add New Folder' : 'Add New Section'}
              </h2>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={activeModal === 'folder' ? 'Folder name' : 'Section name'}
                value={activeModal === 'folder' ? newFolderName : newSectionName}
                onChange={(e) => 
                  activeModal === 'folder' 
                    ? setNewFolderName(e.target.value) 
                    : setNewSectionName(e.target.value)
                }
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  onClick={handleAddItem}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename Modal */}
        {showRenameModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div 
              className="bg-white p-6 rounded-lg shadow-xl w-80 transform transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">
                Rename {renameItem.type === 'folder' ? 'Folder' : 'Section'}
              </h2>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={renameItem.name}
                onChange={(e) => setRenameItem({...renameItem, name: e.target.value})}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                  onClick={() => setShowRenameModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  onClick={handleRenameItem}
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div 
              className="bg-white p-6 rounded-lg shadow-xl w-80 transform transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">
                Delete {itemToDelete.type === 'folder' ? 'Folder' : 'Section'}
              </h2>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete this {itemToDelete.type}? 
                {itemToDelete.type === 'section' && ' All folders within this section will also be deleted.'}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                  onClick={handleDeleteItem}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderPage;