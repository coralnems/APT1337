import axios from 'axios';

// Base API URL - can be switched between development and production
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : '/api'; // Or your production URL

console.log('API Base URL:', API_BASE_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include JWT token from localStorage
apiClient.interceptors.request.use(
  config => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    
    // For development, use a dummy token if none exists
    let token = localStorage.getItem('token');
    if (!token && process.env.NODE_ENV === 'development') {
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      localStorage.setItem('token', token);
      console.log('Using development test token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log(`Received response from ${response.config.url}:`, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    }
    return Promise.reject(error);
  }
);

// Map of API endpoints
const ApiService = {
  // Authentication
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  
  // Drone Operations
  connectDrone: (connectionDetails) => apiClient.post('/drone/connect', connectionDetails),
  disconnectDrone: () => apiClient.post('/drone/disconnect'),
  getTelemetry: () => apiClient.get('/telemetry'),
  createMission: (missionData) => apiClient.post('/drone/mission', missionData),
  uploadMission: () => apiClient.post('/drone/mission/upload'),
  startMission: () => apiClient.post('/drone/mission/start'),
  pauseMission: () => apiClient.post('/drone/mission/pause'),
  returnToHome: () => apiClient.post('/drone/rth'),
  emergencyStop: () => apiClient.post('/drone/emergency-stop'),
  toggleSpotlight: (spotlightData) => apiClient.post('/drone/spotlight', spotlightData),
  configureCamera: (cameraSettings) => apiClient.post('/drone/camera', cameraSettings),
  
  // Mapping
  startMapping: (mappingParams) => apiClient.post('/mapping/start', mappingParams),
  stopMapping: () => apiClient.post('/mapping/stop'),
  getMappingStatus: () => apiClient.get('/mapping/status'),
  exportMapping: (exportParams) => apiClient.post('/mapping/export', exportParams),
  setMockMode: (mockMode) => apiClient.post('/mapping/mock', { mock: mockMode }),
  
  // Detection
  configureDetection: (detectionSettings) => apiClient.post('/detection/settings', detectionSettings),
  
  // System
  getSystemStatus: () => apiClient.get('/status'),
  setMode: (mode) => apiClient.post('/mode', { mode }),
  
  // Mock Control
  configureMock: (mockSettings) => apiClient.post('/mock/settings', mockSettings),
};

export default ApiService;
