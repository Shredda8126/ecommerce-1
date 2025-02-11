// Auth state management
const authButtons = document.getElementById('auth-buttons');

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch('/auth/status');
        const data = await response.json();
        updateAuthUI(data);
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

// Update UI based on authentication status
function updateAuthUI(authData) {
    const { isAuthenticated, user } = authData;
    
    authButtons.innerHTML = isAuthenticated
        ? `
            <a href="/profile" class="nav-link">Profile</a>
            <a href="/logout" class="nav-link">Logout</a>
          `
        : `
            <a href="/login" class="nav-link">Login</a>
          `;
}

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', checkAuth);
