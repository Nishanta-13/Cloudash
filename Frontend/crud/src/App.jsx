// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './Context/AppContext';
import Layout from './Components/Layout';
import SectionsPage from './Pages/Sections';
import FoldersPage from './Pages/Folder';
import FilesGalleryPage from './Pages/FilesGalleryPage';
import NotFoundPage from './Pages/NotFoundPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<SectionsPage />} />
            <Route path="/section/:sectionId" element={<FoldersPage />} />
            <Route path="/section/:sectionId/folder/:folderId" element={<FilesGalleryPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;