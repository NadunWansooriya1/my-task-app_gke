// API Configuration
// Using relative URLs works because Ingress routes /api to backend
// and / to frontend on the same domain
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocalhost 
  ? 'http://localhost:8080'
  : ''; // Empty string = same domain as frontend (works with Ingress)

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  TASKS: `${API_BASE_URL}/api/tasks`,
};