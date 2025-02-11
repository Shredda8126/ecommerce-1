// Profile page initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get user authentication status
        const response = await fetch('/auth/status');
        const { isAuthenticated, isAdmin, user } = await response.json();

        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        // Show/hide admin section based on role
        const adminSection = document.getElementById('admin-section');
        if (adminSection) {
            adminSection.style.display = isAdmin ? 'flex' : 'none';
        }

        // Update profile information
        if (user) {
            document.getElementById('profile-name').textContent = user.name || 'No name set';
            document.getElementById('profile-email').textContent = user.email || 'No email set';
            
            // Set form values
            document.getElementById('name').value = user.name || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('address').value = user.address || '';
            
            // Set profile image
            const profileImage = document.getElementById('profile-image');
            if (profileImage) {
                profileImage.src = user.picture || 'images/default-avatar.png';
            }
        }

        // Handle form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = {
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    address: document.getElementById('address').value
                };

                try {
                    const response = await fetch('/api/profile/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    if (response.ok) {
                        alert('Profile updated successfully!');
                    } else {
                        throw new Error('Failed to update profile');
                    }
                } catch (error) {
                    console.error('Error updating profile:', error);
                    alert('Failed to update profile. Please try again.');
                }
            });
        }

        // Toggle switches functionality
        const notificationsToggle = document.getElementById('notifications-toggle');
        const twoFactorToggle = document.getElementById('2fa-toggle');

        if (notificationsToggle) {
            notificationsToggle.checked = user.notifications_enabled || false;
            notificationsToggle.addEventListener('change', async (e) => {
                try {
                    await updateUserPreference('notifications_enabled', e.target.checked);
                } catch (error) {
                    console.error('Error updating notifications preference:', error);
                    e.target.checked = !e.target.checked; // Revert on error
                }
            });
        }

        if (twoFactorToggle) {
            twoFactorToggle.checked = user.two_factor_enabled || false;
            twoFactorToggle.addEventListener('change', async (e) => {
                try {
                    await updateUserPreference('two_factor_enabled', e.target.checked);
                } catch (error) {
                    console.error('Error updating 2FA preference:', error);
                    e.target.checked = !e.target.checked; // Revert on error
                }
            });
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile information. Please try again.');
    }
});

// Helper function to update user preferences
async function updateUserPreference(preference, value) {
    const response = await fetch('/api/profile/preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            preference,
            value
        })
    });

    if (!response.ok) {
        throw new Error('Failed to update preference');
    }
}

// Handle avatar upload
const profileAvatar = document.querySelector('.profile-avatar');
profileAvatar.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            
            try {
                const response = await fetch('/api/profile/avatar', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('profile-image').src = data.avatarUrl;
                    alert('Profile picture updated!');
                }
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert('Failed to upload profile picture');
            }
        }
    });
    
    fileInput.click();
});

// Notification helper
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification to the page
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
