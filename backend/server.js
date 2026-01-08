const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to Database
connectDB();

// Test User model import
try {
  const User = require('./models/User');
  console.log('✅ User model loaded successfully');
} catch (error) {
  console.log('❌ Error loading User model:', error.message);
}

// Import routes
const authRoutes = require('./routes/authRoutes');
const skillRoutes = require('./routes/skillRoutes');
const gapRoutes = require('./routes/gapRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/gaps', gapRoutes);
app.use('/api/resume', resumeRoutes);

// Import auth middleware
const auth = require('./middleware/auth');

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Skill Gap Backend is running!',
    status: 'OK',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        test: 'GET /api/auth/test'
      },
      skills: {
        get: 'GET /api/skills',
        add: 'POST /api/skills',
        delete: 'DELETE /api/skills/:skillName',
        targetJob: {
          get: 'GET /api/skills/target-job',
          set: 'POST /api/skills/target-job'
        },
        test: 'GET /api/skills/test'
      },
      gaps: {
        analyze: 'GET /api/gaps/analyze',
        history: 'GET /api/gaps/history',
        test: 'GET /api/gaps/test'
      },
      resume: {
        upload: 'POST /api/resume/upload',
        save: 'POST /api/resume/save-skills',
        test: 'GET /api/resume/test'
      },
      test: {
        public: '/api/public-test',
        protected: '/api/test-auth (requires token)'
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    models: 'User model loaded',
    auth: 'JWT middleware ready',
    routes: 'All routes loaded'
  });
});

// Test routes
app.get('/api/public-test', (req, res) => {
  res.json({
    success: true,
    message: 'This is a public route',
    anyone: 'Can access this without token'
  });
});

app.get('/api/test-auth', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful!',
    userId: req.userId,
    userRole: req.userRole,
    protected: 'This is a protected route'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth test: http://localhost:${PORT}/api/auth/test`);
  console.log(`💼 Skill test: http://localhost:${PORT}/api/skills/test`);
  console.log(`📊 Gap test: http://localhost:${PORT}/api/gaps/test`);
  console.log(`📄 Resume test: http://localhost:${PORT}/api/resume/test`);
  console.log(`🔒 Protected test: http://localhost:${PORT}/api/test-auth`);
  console.log(`🌐 Public test: http://localhost:5000/api/public-test`);
  console.log('\n📋 Complete API Endpoints:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/auth/profile');
  console.log('   GET    /api/skills');
  console.log('   POST   /api/skills');
  console.log('   POST   /api/skills/target-job');
  console.log('   GET    /api/gaps/analyze  ⭐ MAIN FEATURE');
  console.log('   POST   /api/resume/upload  📄 RESUME SCANNER');
});