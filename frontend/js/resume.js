import { showMessage } from './api.js';

// DOM Elements
let resumeFileInput = document.getElementById('resumeFile');
let uploadArea = document.getElementById('uploadArea');
let fileInfo = document.getElementById('fileInfo');
let uploadProgress = document.getElementById('uploadProgress');
let progressFill = document.getElementById('progressFill');
let progressText = document.getElementById('progressText');
let analysisResult = document.getElementById('analysisResult');
let extractedSkills = document.getElementById('extractedSkills');
let saveSkillsBtn = document.getElementById('saveSkillsBtn');
let analyzeAgainBtn = document.getElementById('analyzeAgainBtn');

let currentSkills = [];

// Initialize resume scanner
export const initResumeScanner = () => {
    if (!resumeFileInput) return;
    
    setupFileUpload();
    setupEventListeners();
};

// Setup file upload
const setupFileUpload = () => {
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    // File input change
    resumeFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    // Click upload area
    uploadArea.addEventListener('click', () => {
        resumeFileInput.click();
    });
};

// Setup event listeners
const setupEventListeners = () => {
    if (saveSkillsBtn) {
        saveSkillsBtn.addEventListener('click', saveExtractedSkills);
    }
    
    if (analyzeAgainBtn) {
        analyzeAgainBtn.addEventListener('click', resetUploader);
    }
};

// Handle file selection
const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'text/plain'];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
        showMessage('Please upload a PDF, DOC, DOCX, or TXT file', 'error');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('File size should be less than 5MB', 'error');
        return;
    }
    
    // Show file info
    fileInfo.innerHTML = `
        <div class="file-item">
            <i class="fas fa-file"></i>
            <div class="file-details">
                <strong>${file.name}</strong>
                <span>${(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <button class="btn-remove" onclick="removeFile()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Start upload
    uploadResume(file);
};

// Upload resume to backend
const uploadResume = async (file) => {
    try {
        // Show progress
        uploadProgress.style.display = 'block';
        progressFill.style.width = '30%';
        progressText.textContent = 'Uploading resume...';
        
        const formData = new FormData();
        formData.append('resume', file);
        
        const token = localStorage.getItem('skillgap_token');
        
        const response = await fetch('http://localhost:5000/api/resume/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        progressFill.style.width = '70%';
        progressText.textContent = 'Analyzing skills...';
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }
        
        progressFill.style.width = '100%';
        progressText.textContent = 'Analysis complete!';
        
        setTimeout(() => {
            displayExtractedSkills(result);
        }, 500);
        
    } catch (error) {
        console.error('Upload error:', error);
        showMessage(error.message || 'Failed to upload resume', 'error');
        resetUploader();
    }
};

// Display extracted skills
const displayExtractedSkills = (result) => {
    uploadProgress.style.display = 'none';
    analysisResult.style.display = 'block';
    
    currentSkills = result.skills || [];
    
    if (currentSkills.length > 0) {
        extractedSkills.innerHTML = currentSkills.map(skill => `
            <div class="skill-card">
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <span class="confidence-badge">${skill.confidence}%</span>
                </div>
                <div class="skill-level">
                    Level: ${'★'.repeat(skill.level)}${'☆'.repeat(5 - skill.level)}
                    <span class="level-number">(${skill.level}/5)</span>
                </div>
                <div class="skill-category">
                    <span class="category-badge">${skill.category}</span>
                </div>
            </div>
        `).join('');
        
        showMessage(`Found ${currentSkills.length} skills in your resume!`, 'success');
    } else {
        extractedSkills.innerHTML = `
            <div class="no-data">
                <i class="fas fa-search"></i>
                <p>No skills detected in the resume. Try uploading a different file.</p>
            </div>
        `;
        saveSkillsBtn.disabled = true;
    }
};

// Save extracted skills to profile
const saveExtractedSkills = async () => {
    try {
        saveSkillsBtn.disabled = true;
        saveSkillsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        const token = localStorage.getItem('skillgap_token');
        
        const response = await fetch('http://localhost:5000/api/resume/save-skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ skills: currentSkills })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(`Successfully added ${result.addedSkills.length} skills to your profile!`, 'success');
            
            // Update skills list if on skills page
            if (typeof window.loadSkills === 'function') {
                window.loadSkills();
            }
            
            // Reset after 2 seconds
            setTimeout(() => {
                resetUploader();
            }, 2000);
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Save skills error:', error);
        showMessage(error.message || 'Failed to save skills', 'error');
        saveSkillsBtn.disabled = false;
        saveSkillsBtn.innerHTML = '<i class="fas fa-save"></i> Add to My Skills';
    }
};

// Reset uploader
const resetUploader = () => {
    resumeFileInput.value = '';
    fileInfo.innerHTML = '';
    uploadProgress.style.display = 'none';
    analysisResult.style.display = 'none';
    progressFill.style.width = '0%';
    saveSkillsBtn.disabled = false;
    saveSkillsBtn.innerHTML = '<i class="fas fa-save"></i> Add to My Skills';
    currentSkills = [];
};

// Global functions for onclick
window.removeFile = () => {
    resumeFileInput.value = '';
    fileInfo.innerHTML = '';
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('resumeSection')) {
        initResumeScanner();
    }
});