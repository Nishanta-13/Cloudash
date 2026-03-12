import { NavLink, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../Context/AppContext';

export default function Sidebar() {
  const { sectionId: currentSectionId, folderId: currentFolderId } = useParams(); // get from URL

  const {
    sections,
    setSections,
    folders,
    setFolders,
    loadingFolders,
    setLoadingFolders,
    error,
    setError
  } = useAppContext();

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await axios.get('https://cloudash-backend.onrender.com/api/section');
        setSections(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Failed to fetch sections:', error);
        setSections([]);
        setError('Failed to load sections');
      }
    };
    fetchSections();
  }, [setSections, setError]);

  useEffect(() => {
    if (currentSectionId) {
      const fetchFolders = async () => {
        setLoadingFolders(true);
        try {
          const res = await axios.get(`https://cloudash-backend.onrender.com/api/folder?sectionId=${currentSectionId}`);
          setFolders(Array.isArray(res.data) ? res.data : []);
          setError(null);
        } catch (error) {
          console.error('Failed to fetch folders:', error);
          setFolders([]);
          setError('Failed to load folders');
        } finally {
          setLoadingFolders(false);
        }
      };
      fetchFolders();
    }
  }, [currentSectionId, setFolders, setLoadingFolders, setError]);

  return (
    <aside className="w-64 min-h-screen border-r bg-white border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Media Library
        </h2>

        {error && (
          <div className="mt-2 p-2 rounded text-sm bg-red-100 text-red-800">
            {error}
          </div>
        )}

        <nav className="mt-6">

          <div className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <HomeIcon className="mr-3 h-5 w-5" />
              Home
            </NavLink>
          </div>


          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Sections
            </h3>
            <div className="mt-2 space-y-1">
              {sections.map((section) => (
                <NavLink
                  key={section._id}
                  to={`/section/${section._id}`}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <FolderIcon className="mr-3 h-5 w-5" />
                  {section.name}
                </NavLink>
              ))}
            </div>
          </div>


          {currentSectionId && (
            <div className="mt-4">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Folders
              </h3>
              {loadingFolders ? (
                <div className="px-3 py-2 text-sm text-gray-500">Loading folders...</div>
              ) : folders.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {folders.map((folder) => (
                    <NavLink
                      key={folder._id}
                      to={`/section/${currentSectionId}/folder/${folder._id}`}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive || folder._id === currentFolderId
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <FolderOpenIcon className="mr-3 h-5 w-5" />
                      {folder.name}
                    </NavLink>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No folders found</div>
              )}
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}

// Icons
function HomeIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}

function FolderIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
  );
}

function FolderOpenIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0a0 2 0 000 4h12a2 2 0 100-4H4z" clipRule="evenodd" />
    </svg>
  );
}
