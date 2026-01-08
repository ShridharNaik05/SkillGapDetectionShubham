const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');

// Only keep working route
router.post('/upload', auth, resumeController.uploadResume);

// Remove other routes for now
// router.post('/save-skills', auth, (req, res) => {
//   res.json({ success: true, message: 'Demo: Skills saved' });
// });

// router.get('/history', auth, (req, res) => {
//   res.json({ success: true, history: [] });
// });

// Test route
router.get('/test', auth, (req, res) => {
  res.json({ 
    message: 'Resume routes are working!',
    userId: req.userId 
  });
});

module.exports = router;