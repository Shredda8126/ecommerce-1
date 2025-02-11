const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

// Auth0 configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  clientSecret: process.env.AUTH0_SECRET,
  authorizationParams: {
    response_type: 'code',
    audience: process.env.AUTH0_AUDIENCE,
    scope: process.env.AUTH0_SCOPE
  }
};

// Debug logging
console.log('Auth0 Configuration:', {
  baseURL: config.baseURL,
  clientID: config.clientID,
  issuerBaseURL: config.issuerBaseURL
});

// Auth0 middleware
app.use(auth(config));

// Middleware to check admin role
const requiresAdmin = (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Get role from custom claim
  const role = req.oidc.user['https://your-app/role'];
  
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// Check authentication status
app.get('/auth/status', (req, res) => {
  const user = req.oidc.user || null;
  
  res.json({ 
    isAuthenticated: req.oidc.isAuthenticated(),
    isAdmin: user?.['https://your-app/role'] === 'admin',
    user: user
  });
});

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Auth routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Admin routes
app.get('/admin/dashboard', requiresAdmin, (req, res) => {
  res.sendFile(__dirname + '/public/admin/dashboard.html');
});

// Admin API endpoints
app.get('/api/admin/profile', requiresAdmin, (req, res) => {
  res.json(req.oidc.user);
});

app.get('/api/admin/dashboard', requiresAdmin, (req, res) => {
  // Mock dashboard data
  res.json({
    orders: 150,
    revenue: 15000,
    products: 45,
    users: 120
  });
});

app.get('/api/admin/products', requiresAdmin, (req, res) => {
  // Mock products data
  res.json([]);
});

app.post('/api/admin/products', requiresAdmin, (req, res) => {
  // Handle product creation
  res.json({ success: true });
});

app.get('/api/admin/orders', requiresAdmin, (req, res) => {
  // Mock orders data
  res.json([]);
});

app.get('/api/admin/users', requiresAdmin, (req, res) => {
  // Mock users data
  res.json([]);
});

// Test endpoint to check admin role
app.get('/api/check-admin', requiresAdmin, (req, res) => {
  const role = req.oidc.idToken?.role || req.oidc.accessToken?.role;
  const user = req.oidc.user;
  
  res.json({
    message: 'You have admin access!',
    role: role,
    user: {
      email: user.email,
      name: user.name,
      picture: user.picture
    }
  });
});

// Profile routes
app.get('/profile', requiresAuth(), (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    res.json(req.oidc.user);
  } else {
    res.sendFile(__dirname + '/public/profile.html');
  }
});

// Profile API endpoints
app.post('/api/profile/update', requiresAuth(), (req, res) => {
  res.json({ success: true });
});

app.post('/api/profile/avatar', requiresAuth(), (req, res) => {
  res.json({ 
    success: true, 
    avatarUrl: req.oidc.user.picture 
  });
});

app.post('/api/profile/settings', requiresAuth(), (req, res) => {
  res.json({ success: true });
});

// Check authentication status
app.get('/auth/status', (req, res) => {
  const user = req.oidc.user || null;
  const role = req.oidc.idToken?.role || req.oidc.accessToken?.role;
  
  res.json({ 
    isAuthenticated: req.oidc.isAuthenticated(),
    isAdmin: role === 'admin',
    user: user
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
