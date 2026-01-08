const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const auth = require('../middleware/auth');

// All skill routes require authentication
router.use(auth);

// Skill management
router.get('/', skillController.getUserSkills);
router.post('/', skillController.addSkill);
router.delete('/:skillName', skillController.removeSkill);

// Target job management
router.get('/target-job', skillController.getTargetJob);
router.post('/target-job', skillController.setTargetJob);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Skill routes are working!',
    userId: req.userId 
  });
});

module.exports = router;