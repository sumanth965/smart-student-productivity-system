const LOCAL_BACKEND_URL = 'http://localhost:5000';
const DEPLOYED_BACKEND_URL = 'https://smart-student-productivity-system-backend.onrender.com';

const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : '';
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

// VITE_API_URL env var takes highest priority (set this in Vercel dashboard)
// Falls back to localhost URL locally, deployed URL in production
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalHost ? LOCAL_BACKEND_URL : DEPLOYED_BACKEND_URL);
