import { createContext, useState, useContext, use } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sections, setSections] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [error, setError] = useState(null);

  return (
    <AppContext.Provider value={{ sections, folders, loadingFolders, error, setSections, setFolders, setLoadingFolders, setError }}>{children}
    </AppContext.Provider>
  )
}
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}