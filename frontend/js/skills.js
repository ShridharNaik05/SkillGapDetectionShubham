import { skillsAPI, showMessage } from './api.js';

// DOM Elements
let skillsList = document.getElementById('skillsList');
let addSkillForm = document.getElementById('addSkillForm');
let targetJobForm = document.getElementById('targetJobForm');

// Load skills from API
export const loadSkills = async () => {
    if (!skillsList) return;
    
    try {
        skillsList.innerHTML = '<div class="loading">Loading skills...</div>';
        
        const result = await skillsAPI.getSkills();
        
        if (result.success && result.skills.length > 0) {
            skillsList.innerHTML = result.skills.map(skill => `
                <div class="skill-card" data-skill="${skill.name}">
                    <div class="skill-header">
                        <span class="skill-name">${skill.name}</span>
                        <button class="btn-delete" onclick="deleteSkill('${skill.name}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="skill-details">
                        <div class="skill-level">
                            Level: 
                            <span class="stars">
                                ${'★'.repeat(skill.level)}${'☆'.repeat(5 - skill.level)}
                            </span>
                            <span class="level-number">(${skill.level}/5)</span>
                        </div>
                        <div class="skill-category">
                            <span class="category-badge">${skill.category}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            skillsList.innerHTML = '<div class="no-data">No skills added yet. Add your first skill above!</div>';
        }
    } catch (error) {
        skillsList.innerHTML = '<div class="error">Failed to load skills</div>';
        console.error('Load skills error:', error);
    }
};

// Add skill
export const setupAddSkill = () => {
    if (addSkillForm) {
        addSkillForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('skillName').value.trim();
            const level = parseInt(document.getElementById('skillLevel').value);
            const category = document.getElementById('skillCategory').value;
            
            if (!name) {
                showMessage('Please enter a skill name', 'error');
                return;
            }
            
            try {
                const result = await skillsAPI.addSkill({ name, level, category });
                
                if (result.success) {
                    showMessage('Skill added successfully', 'success');
                    addSkillForm.reset();
                    await loadSkills();
                } else {
                    showMessage(result.message || 'Failed to add skill', 'error');
                }
            } catch (error) {
                showMessage('Failed to add skill. Please try again.', 'error');
                console.error('Add skill error:', error);
            }
        });
    }
};

// Delete skill (global function for onclick)
window.deleteSkill = async (skillName) => {
    if (!confirm(`Are you sure you want to delete "${skillName}"?`)) {
        return;
    }
    
    try {
        const result = await skillsAPI.deleteSkill(skillName);
        
        if (result.success) {
            showMessage('Skill deleted successfully', 'success');
            await loadSkills();
        } else {
            showMessage(result.message || 'Failed to delete skill', 'error');
        }
    } catch (error) {
        showMessage('Failed to delete skill. Please try again.', 'error');
        console.error('Delete skill error:', error);
    }
};

// Load target job
export const loadTargetJob = async () => {
    const currentJobDiv = document.getElementById('currentJob');
    if (!currentJobDiv) return;
    
    try {
        const result = await skillsAPI.getTargetJob();
        
        if (result.success && result.targetJob) {
            currentJobDiv.innerHTML = `
                <div class="current-job-card">
                    <h4>Current Target Job</h4>
                    <div class="job-title">${result.targetJob.title}</div>
                    ${result.targetJob.industry ? `<div class="job-industry">Industry: ${result.targetJob.industry}</div>` : ''}
                    ${result.targetJob.requiredSkills && result.targetJob.requiredSkills.length > 0 ? 
                        `<div class="job-skills">
                            <strong>Required Skills:</strong>
                            <div class="skill-tags">
                                ${result.targetJob.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                        </div>` : ''}
                </div>
            `;
        } else {
            currentJobDiv.innerHTML = '<div class="no-data">No target job set yet.</div>';
        }
    } catch (error) {
        currentJobDiv.innerHTML = '<div class="error">Failed to load target job</div>';
        console.error('Load target job error:', error);
    }
};

// Setup target job form
export const setupTargetJob = () => {
    if (targetJobForm) {
        targetJobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('jobTitle').value;
            const industry = document.getElementById('jobIndustry')?.value || '';
            const requiredSkills = document.getElementById('requiredSkills')?.value 
                ? document.getElementById('requiredSkills').value.split(',').map(s => s.trim()).filter(s => s)
                : [];
            
            if (!title) {
                showMessage('Please enter a job title', 'error');
                return;
            }
            
            try {
                const result = await skillsAPI.setTargetJob({ title, industry, requiredSkills });
                
                if (result.success) {
                    showMessage('Target job saved successfully', 'success');
                    targetJobForm.reset();
                    await loadTargetJob();
                } else {
                    showMessage(result.message || 'Failed to save target job', 'error');
                }
            } catch (error) {
                showMessage('Failed to save target job. Please try again.', 'error');
                console.error('Set target job error:', error);
            }
        });
    }
};

// Initialize skills module
export const initSkills = () => {
    if (document.getElementById('skillsSection') || skillsList) {
        loadSkills();
        setupAddSkill();
    }
    
    if (document.getElementById('targetJobSection') || targetJobForm) {
        loadTargetJob();
        setupTargetJob();
    }
};