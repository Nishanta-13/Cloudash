import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">Page not found</p>
      <button 
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go Home
      </button>
    </div>
  );
}