const User = require('../models/User');

// Sample skill requirements for different jobs
const jobRequirements = {
  'frontend developer': {
    requiredSkills: [
      { name: 'HTML', level: 4 },
      { name: 'CSS', level: 4 },
      { name: 'JavaScript', level: 4 },
      { name: 'React', level: 3 },
      { name: 'Git', level: 3 },
      { name: 'Problem Solving', level: 4 },
      { name: 'Communication', level: 3 }
    ]
  },
  'backend developer': {
    requiredSkills: [
      { name: 'Node.js', level: 4 },
      { name: 'Express', level: 4 },
      { name: 'MongoDB', level: 3 },
      { name: 'REST API', level: 4 },
      { name: 'Git', level: 3 },
      { name: 'Problem Solving', level: 4 },
      { name: 'Database Design', level: 3 }
    ]
  },
  'full stack developer': {
    requiredSkills: [
      { name: 'HTML', level: 4 },
      { name: 'CSS', level: 4 },
      { name: 'JavaScript', level: 4 },
      { name: 'React', level: 3 },
      { name: 'Node.js', level: 4 },
      { name: 'Express', level: 4 },
      { name: 'MongoDB', level: 3 },
      { name: 'Git', level: 4 },
      { name: 'Problem Solving', level: 4 }
    ]
  },
  'data analyst': {
    requiredSkills: [
      { name: 'Python', level: 4 },
      { name: 'SQL', level: 4 },
      { name: 'Excel', level: 4 },
      { name: 'Data Visualization', level: 3 },
      { name: 'Statistics', level: 3 },
      { name: 'Critical Thinking', level: 4 }
    ]
  }
};

// @desc    Analyze skill gaps
// @route   GET /api/gaps/analyze
exports.analyzeGaps = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.targetJob || !user.targetJob.title) {
      return res.status(400).json({
        success: false,
        message: 'Please set a target job first'
      });
    }

    const jobTitle = user.targetJob.title.toLowerCase();
    const requirements = jobRequirements[jobTitle] || jobRequirements['full stack developer'];
    
    const userSkillsMap = {};
    user.skills.forEach(skill => {
      userSkillsMap[skill.name.toLowerCase()] = skill.level;
    });

    // Calculate gaps
    const gaps = [];
    let totalGapScore = 0;
    let criticalGaps = 0;

    requirements.requiredSkills.forEach(reqSkill => {
      const userLevel = userSkillsMap[reqSkill.name.toLowerCase()] || 0;
      const gap = Math.max(0, reqSkill.level - userLevel);
      
      if (gap > 0) {
        const priority = gap >= 2 ? 'high' : (gap === 1 ? 'medium' : 'low');
        
        if (gap >= 2) criticalGaps++;
        
        gaps.push({
          skill: reqSkill.name,
          currentLevel: userLevel,
          requiredLevel: reqSkill.level,
          gap: gap,
          priority: priority,
          resources: getLearningResources(reqSkill.name)
        });
        
        totalGapScore += gap;
      }
    });

    // Calculate readiness percentage
    const totalRequiredPoints = requirements.requiredSkills.reduce((sum, skill) => sum + skill.level, 0);
    const userPoints = requirements.requiredSkills.reduce((sum, skill) => {
      return sum + Math.min(userSkillsMap[skill.name.toLowerCase()] || 0, skill.level);
    }, 0);
    
    const readinessPercentage = Math.round((userPoints / totalRequiredPoints) * 100);

    res.json({
      success: true,
      analysis: {
        jobTitle: user.targetJob.title,
        totalSkillsRequired: requirements.requiredSkills.length,
        skillsWithGaps: gaps.length,
        criticalGaps: criticalGaps,
        totalGapScore: totalGapScore,
        readinessPercentage: readinessPercentage,
        readinessLevel: getReadinessLevel(readinessPercentage),
        gaps: gaps,
        recommendations: getRecommendations(gaps, readinessPercentage)
      }
    });

  } catch (error) {
    console.error('Analyze gaps error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during gap analysis',
      error: error.message
    });
  }
};

// Helper function: Get learning resources
function getLearningResources(skillName) {
  const resources = {
    'html': [
      { title: 'HTML Crash Course', url: 'https://www.w3schools.com/html/', type: 'tutorial' },
      { title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', type: 'documentation' }
    ],
    'css': [
      { title: 'CSS Tutorial', url: 'https://www.w3schools.com/css/', type: 'tutorial' },
      { title: 'Flexbox Guide', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'article' }
    ],
    'javascript': [
      { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'tutorial' },
      { title: 'MDN JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'documentation' }
    ],
    'react': [
      { title: 'React Official Tutorial', url: 'https://reactjs.org/tutorial/tutorial.html', type: 'tutorial' },
      { title: 'React Docs', url: 'https://react.dev/learn', type: 'documentation' }
    ],
    'node.js': [
      { title: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs/', type: 'documentation' },
      { title: 'Node.js Tutorial', url: 'https://www.tutorialspoint.com/nodejs/', type: 'tutorial' }
    ],
    'express': [
      { title: 'Express.js Guide', url: 'https://expressjs.com/en/starter/installing.html', type: 'documentation' },
      { title: 'Express Crash Course', url: 'https://www.youtube.com/watch?v=L72fhGm1tfE', type: 'video' }
    ],
    'mongodb': [
      { title: 'MongoDB University', url: 'https://university.mongodb.com/', type: 'course' },
      { title: 'MongoDB Docs', url: 'https://docs.mongodb.com/', type: 'documentation' }
    ],
    'git': [
      { title: 'Git Tutorial', url: 'https://www.atlassian.com/git/tutorials', type: 'tutorial' },
      { title: 'Git Cheat Sheet', url: 'https://education.github.com/git-cheat-sheet-education.pdf', type: 'cheatsheet' }
    ],
    'python': [
      { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'tutorial' },
      { title: 'Python for Everybody', url: 'https://www.py4e.com/', type: 'course' }
    ],
    'sql': [
      { title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/', type: 'tutorial' },
      { title: 'SQLZoo', url: 'https://sqlzoo.net/', type: 'practice' }
    ]
  };

  return resources[skillName.toLowerCase()] || [
    { title: `${skillName} Documentation`, url: `https://www.google.com/search?q=${skillName}+tutorial`, type: 'search' }
  ];
}

// Helper function: Get readiness level
function getReadinessLevel(percentage) {
  if (percentage >= 80) return 'Ready';
  if (percentage >= 60) return 'Almost Ready';
  if (percentage >= 40) return 'Getting There';
  if (percentage >= 20) return 'Needs Work';
  return 'Beginner';
}

// Helper function: Get recommendations
function getRecommendations(gaps, readinessPercentage) {
  const recommendations = [];
  
  if (gaps.length === 0) {
    recommendations.push('Excellent! You have all required skills.');
    recommendations.push('Consider adding advanced skills to stand out.');
  } else {
    const highPriorityGaps = gaps.filter(gap => gap.priority === 'high');
    const mediumPriorityGaps = gaps.filter(gap => gap.priority === 'medium');
    
    if (highPriorityGaps.length > 0) {
      recommendations.push(`Focus on ${highPriorityGaps.length} high-priority skills first.`);
    }
    
    if (mediumPriorityGaps.length > 0) {
      recommendations.push(`Work on ${mediumPriorityGaps.length} medium-priority skills.`);
    }
    
    if (readinessPercentage < 50) {
      recommendations.push('Consider taking online courses for foundational skills.');
    } else if (readinessPercentage < 75) {
      recommendations.push('Build projects to practice your skills.');
    } else {
      recommendations.push('Prepare for interviews and update your portfolio.');
    }
  }
  
  return recommendations;
}

// @desc    Get gap analysis history
// @route   GET /api/gaps/history
exports.getGapHistory = async (req, res) => {
  try {
    // For now, return current analysis
    // Later you can store historical data
    res.json({
      success: true,
      message: 'Gap analysis history endpoint',
      note: 'Implement historical tracking as needed'
    });
  } catch (error) {
    console.error('Get gap history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};