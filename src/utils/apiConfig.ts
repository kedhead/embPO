// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://localhost:5000/api'  // For packaged app, the Flask server runs locally
  : '/api';                       // For development, use the proxy from Vite

export { API_BASE_URL };
