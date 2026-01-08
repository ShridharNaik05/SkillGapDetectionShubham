import { authAPI, setAuthToken, setUserData, removeAuthToken, isAuthenticated } from './api.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');

// Redirect if already logged in
export const checkAuth = () => {
    if (isAuthenticated() && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
    if (!isAuthenticated() && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'login.html';
    }
};

// Login Handler
export const setupLogin = () => {
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const loginBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = loginBtn.textContent;
            
            try {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Logging in...';
                
                const result = await authAPI.login({ email, password });
                
                if (result.success) {
                    setAuthToken(result.token);
                    setUserData(result.user);
                    
                    // Show success message
                    showMessage('Login successful! Redirecting...', 'success');
                    
                    // Redirect to dashboard after 1 second
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showMessage(result.message || 'Login failed', 'error');
                }
            } catch (error) {
                showMessage(error.message || 'Network error. Please try again.', 'error');
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = originalText;
            }
        });
    }
};

// Register Handler
export const setupRegister = () => {
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const role = document.getElementById('role')?.value || 'job_seeker';
            
            // Validation
            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage('Password must be at least 6 characters', 'error');
                return;
            }
            
            const registerBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = registerBtn.textContent;
            
            try {
                registerBtn.disabled = true;
                registerBtn.textContent = 'Creating account...';
                
                const result = await authAPI.register({ name, email, password, role });
                
                if (result.success) {
                    showMessage('Registration successful! Please login.', 'success');
                    
                    // Clear form and redirect to login after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showMessage(result.message || 'Registration failed', 'error');
                }
            } catch (error) {
                showMessage(error.message || 'Network error. Please try again.', 'error');
            } finally {
                registerBtn.disabled = false;
                registerBtn.textContent = originalText;
            }
        });
    }
};

// Logout Handler
export const setupLogout = () => {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            removeAuthToken();
            window.location.href = 'index.html';
        });
    }
    
    // Also add logout to any element with class 'logout-link'
    document.querySelectorAll('.logout-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            removeAuthToken();
            window.location.href = 'index.html';
        });
    });
};

// Show message
export const showMessage = (message, type = 'info') => {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add to page
    const container = document.querySelector('.container') || document.body;
    container.prepend(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
};

// Update user info in navbar
export const updateUserInfo = () => {
    const user = getUserData();
    const userInfoElements = document.querySelectorAll('.user-info, #userInfo');
    
    userInfoElements.forEach(element => {
        if (user) {
            element.textContent = `${user.name} (${user.email})`;
            element.style.display = 'block';
        }
    });
};

// Initialize auth module
export const initAuth = () => {
    checkAuth();
    setupLogin();
    setupRegister();
    setupLogout();
    updateUserInfo();
};