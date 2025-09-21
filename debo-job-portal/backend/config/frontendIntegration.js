// Frontend Integration Configuration
// config/frontendIntegration.js

const frontendConfig = {
  // CORS settings for React frontend
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'https://your-frontend-domain.com'
  ],
  
  // API endpoints structure
  apiEndpoints: {
    base: process.env.API_BASE_URL || 'http://localhost:5000',
    auth: '/api/auth',
    profile: '/api/profile',
    jobs: '/api/jobs',
    applications: '/api/applications',
    admin: '/api/admin'
  },

  // File upload settings
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['pdf', 'doc', 'docx'],
    uploadPath: '/uploads/resumes/'
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },

  // Security settings
  security: {
    jwtExpiry: '24h',
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutTime: 15 * 60 * 1000 // 15 minutes
  }
};

module.exports = frontendConfig;
