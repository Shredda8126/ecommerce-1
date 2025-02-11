document.addEventListener('DOMContentLoaded', () => {
    // Initialize admin panel
    initializeAdminPanel();
    
    // Load initial data
    loadDashboardData();
    loadProducts();
    loadOrders();
    loadUsers();
});

// Admin Panel Initialization
function initializeAdminPanel() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.dataset.page;
            switchPage(pageId);
        });
    });

    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Product modal
    const addProductBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    addProductBtn.addEventListener('click', () => {
        productModal.classList.add('active');
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            productModal.classList.remove('active');
        });
    });

    // Product form submission
    const productForm = document.getElementById('product-form');
    productForm.addEventListener('submit', handleProductSubmit);

    // Load admin profile
    loadAdminProfile();
}

// Page Navigation
function switchPage(pageId) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');

    // Show selected page content
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(`${pageId}-page`).classList.remove('hidden');
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        updateDashboardStats(data);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update Dashboard Statistics
function updateDashboardStats(data) {
    // Update stats when we have real data
    // For now, using placeholder data
    const stats = {
        orders: 150,
        revenue: 15000,
        products: 45,
        users: 120
    };

    document.querySelector('.stat-number').textContent = stats.orders;
    document.querySelectorAll('.stat-number')[1].textContent = `$${stats.revenue.toLocaleString()}`;
    document.querySelectorAll('.stat-number')[2].textContent = stats.products;
    document.querySelectorAll('.stat-number')[3].textContent = stats.users;
}

// Products Management
async function loadProducts() {
    try {
        const response = await fetch('/api/admin/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-meta">
                    <span class="price">$${product.price}</span>
                    <span class="stock">Stock: ${product.stock}</span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-secondary" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('product-name').value);
    formData.append('description', document.getElementById('product-description').value);
    formData.append('price', document.getElementById('product-price').value);
    formData.append('stock', document.getElementById('product-stock').value);
    formData.append('category', document.getElementById('product-category').value);
    
    const imageFile = document.getElementById('product-image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.getElementById('product-modal').classList.remove('active');
            loadProducts(); // Reload products
            showNotification('Product added successfully!', 'success');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Error adding product', 'error');
    }
}

// Orders Management
async function loadOrders() {
    try {
        const response = await fetch('/api/admin/orders');
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function displayOrders(orders) {
    const ordersTableBody = document.querySelector('.orders-table tbody');
    ordersTableBody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${order.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Users Management
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsers(users) {
    const usersTableBody = document.querySelector('.users-table tbody');
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewUser('${user.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Admin Profile
async function loadAdminProfile() {
    try {
        const response = await fetch('/api/admin/profile');
        const adminData = await response.json();
        
        document.getElementById('admin-name').textContent = adminData.name;
        document.getElementById('admin-avatar').src = adminData.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(adminData.name);
    } catch (error) {
        console.error('Error loading admin profile:', error);
    }
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
