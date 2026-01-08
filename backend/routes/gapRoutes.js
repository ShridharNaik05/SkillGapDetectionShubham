const express = require('express');
const router = express.Router();
const gapController = require('../controllers/gapController');
const auth = require('../middleware/auth');

// All gap routes require authentication
router.use(auth);

// Gap analysis
router.get('/analyze', gapController.analyzeGaps);
router.get('/history', gapController.getGapHistory);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Gap analysis routes are working!',
    userId: req.userId 
  });
});

module.exports = router;