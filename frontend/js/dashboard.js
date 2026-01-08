import { gapsAPI, showMessage } from './api.js';
import { initSkills } from './skills.js';

// DOM Elements
const analyzeBtn = document.getElementById('analyzeBtn');
const analysisResult = document.getElementById('analysisResult');
const sectionButtons = document.querySelectorAll('.sidebar-btn');

// Initialize dashboard
export const initDashboard = () => {
    // Initialize skills module
    initSkills();
    
    // Setup section switching
    setupSectionSwitching();
    
    // Setup gap analysis
    setupGapAnalysis();
    
    // Load initial data
    loadDashboardData();
};

// Section switching
const setupSectionSwitching = () => {
    sectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
};

// Switch section
const switchSection = (sectionId) => {
    // Update active button
    sectionButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === sectionId) {
            btn.classList.add('active');
        }
    });
    
    // Show selected section
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === `${sectionId}Section`) {
            section.classList.add('active');
        }
    });
};

// Setup gap analysis
const setupGapAnalysis = () => {
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            await runGapAnalysis();
        });
    }
};

// Run gap analysis
export const runGapAnalysis = async () => {
    if (!analysisResult) return;
    
    try {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        
        const result = await gapsAPI.analyze();
        
        if (result.success) {
            displayAnalysisResult(result.analysis);
        } else {
            showMessage(result.message || 'Analysis failed', 'error');
            analysisResult.innerHTML = `<div class="error">${result.message}</div>`;
        }
    } catch (error) {
        showMessage('Failed to analyze gaps. Please try again.', 'error');
        analysisResult.innerHTML = `<div class="error">${error.message}</div>`;
        console.error('Gap analysis error:', error);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Skill Gaps';
    }
};

// Display analysis result
const displayAnalysisResult = (analysis) => {
    if (!analysisResult) return;
    
    analysisResult.innerHTML = `
        <div class="analysis-summary">
            <h3>Analysis for: ${analysis.jobTitle}</h3>
            
            <div class="readiness-score">
                <div class="score-circle ${analysis.readinessLevel.toLowerCase().replace(/\s+/g, '-')}">
                    ${analysis.readinessPercentage}%
                </div>
                <div class="score-label">
                    <h4>${analysis.readinessLevel}</h4>
                    <p>Employability Readiness</p>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${analysis.totalSkillsRequired}</div>
                    <div class="stat-label">Skills Required</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${analysis.skillsWithGaps}</div>
                    <div class="stat-label">Skills with Gaps</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${analysis.criticalGaps}</div>
                    <div class="stat-label">Critical Gaps</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${analysis.totalGapScore}</div>
                    <div class="stat-label">Total Gap Score</div>
                </div>
            </div>
        </div>
        
        ${analysis.gaps.length > 0 ? `
        <div class="gaps-section">
            <h4><i class="fas fa-exclamation-triangle"></i> Skill Gaps Found</h4>
            <div class="gaps-list">
                ${analysis.gaps.map(gap => `
                    <div class="gap-item priority-${gap.priority}">
                        <div class="gap-header">
                            <div class="gap-skill">${gap.skill}</div>
                            <div class="gap-priority">${gap.priority.toUpperCase()} PRIORITY</div>
                        </div>
                        <div class="gap-details">
                            <div class="gap-levels">
                                <span class="current-level">Your Level: ${gap.currentLevel}/5</span>
                                <i class="fas fa-arrow-right"></i>
                                <span class="required-level">Required: ${gap.requiredLevel}/5</span>
                                <span class="gap-size">Gap: ${gap.gap} levels</span>
                            </div>
                            ${gap.resources && gap.resources.length > 0 ? `
                            <div class="gap-resources">
                                <strong>Learning Resources:</strong>
                                <ul>
                                    ${gap.resources.map(resource => `
                                        <li>
                                            <a href="${resource.url}" target="_blank" rel="noopener noreferrer">
                                                <i class="fas fa-external-link-alt"></i> ${resource.title}
                                            </a> 
                                            <span class="resource-type">(${resource.type})</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : `
        <div class="no-gaps">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h4>🎉 Excellent! No Skill Gaps Found!</h4>
            <p>You have all the required skills for "${analysis.jobTitle}"</p>
        </div>
        `}
        
        <div class="recommendations">
            <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
            <ul>
                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Switch to analysis section
    switchSection('analysis');
};

// Load dashboard data
const loadDashboardData = async () => {
    // Load user stats, recent activity, etc.
    // You can expand this function as needed
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        initDashboard();
    }
});