import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
// Import routes
import spaceRoutes from './routes/spaceRoutes.js';
import productRoutes from './routes/productRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import * as authController from './controllers/authController.js';
// Import database
import { sequelize } from './models/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
// Middleware for parsing JSON with increased size limit
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        }
        catch (e) {
            console.error('Invalid JSON:', e);
            res.status(400).json({ error: 'Invalid JSON' });
        }
    }
}));
// Global request logging middleware
app.use((req, res, next) => {
    console.log('==================== GLOBAL REQUEST DEBUG ====================');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    // Capture raw body for debugging
    let rawBody = '';
    req.on('data', (chunk) => {
        rawBody += chunk;
    });
    req.on('end', () => {
        console.log('Raw Body:', rawBody);
    });
    next();
});
// CORS configuration
app.use(cors({
    origin: '*', // Be more specific in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Rate limiting middleware for general routes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
// Less strict rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    max: 50, // Allow 50 requests per window
    message: { error: 'Too many authentication attempts. Please try again in 5 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});
// Apply rate limiting to all routes
app.use(limiter);
// Auth routes (with auth-specific rate limiting)
app.use('/auth', authLimiter);
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
// Space routes (protected by authentication)
app.use('/spaces', spaceRoutes);
// Product routes (protected by authentication)
app.use('/products', productRoutes);
// Collection routes (protected by authentication)
app.use('/collections', collectionRoutes);
// Log all registered routes
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(`Registered Route: ${Object.keys(middleware.route.methods).join(', ')} ${middleware.route.path}`);
    }
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});
// 404 handler
app.use((_req, res) => {
    console.log('404 - Route Not Found');
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});
// Initialize database connection and start server
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
}
startServer();
export default app;
//# sourceMappingURL=app.js.map