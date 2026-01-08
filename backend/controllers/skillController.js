const User = require('../models/User');

// @desc    Get all user skills
// @route   GET /api/skills
exports.getUserSkills = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('skills');
    
    res.json({
      success: true,
      skills: user.skills || []
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add or update a skill
// @route   POST /api/skills
exports.addSkill = async (req, res) => {
  try {
    const { name, level, category } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    const user = await User.findById(req.userId);
    
    // Check if skill already exists
    const skillIndex = user.skills.findIndex(skill => 
      skill.name.toLowerCase() === name.toLowerCase()
    );

    if (skillIndex > -1) {
      // Update existing skill
      user.skills[skillIndex] = {
        name,
        level: level || user.skills[skillIndex].level,
        category: category || user.skills[skillIndex].category
      };
    } else {
      // Add new skill
      user.skills.push({
        name,
        level: level || 1,
        category: category || 'technical'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: skillIndex > -1 ? 'Skill updated' : 'Skill added',
      skills: user.skills
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove a skill
// @route   DELETE /api/skills/:skillName
exports.removeSkill = async (req, res) => {
  try {
    const { skillName } = req.params;
    
    const user = await User.findById(req.userId);
    
    // Filter out the skill
    const initialLength = user.skills.length;
    user.skills = user.skills.filter(skill => 
      skill.name.toLowerCase() !== skillName.toLowerCase()
    );
    
    if (user.skills.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Skill removed',
      skills: user.skills
    });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Set target job
// @route   POST /api/skills/target-job
exports.setTargetJob = async (req, res) => {
  try {
    const { title, industry, requiredSkills } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const user = await User.findById(req.userId);
    
    user.targetJob = {
      title,
      industry: industry || '',
      requiredSkills: requiredSkills || []
    };

    await user.save();

    res.json({
      success: true,
      message: 'Target job set successfully',
      targetJob: user.targetJob
    });
  } catch (error) {
    console.error('Set target job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get target job
// @route   GET /api/skills/target-job
exports.getTargetJob = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('targetJob');
    
    res.json({
      success: true,
      targetJob: user.targetJob || null
    });
  } catch (error) {
    console.error('Get target job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};