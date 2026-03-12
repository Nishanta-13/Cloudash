// Central API base URL for the frontend
// Uses Vite env variable VITE_API_URL when available, falls back to the deployed backend.
export const API_BASE = import.meta.env.VITE_API_URL || 'https://cloudash-backend.onrender.com';

export default API_BASE;
