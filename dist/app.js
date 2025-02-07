import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import rateLimit from 'express-rate-limit';
import spaceRoutes from './routes/spaceRoutes.js';
import productRoutes from './routes/productRoutes.js';
import * as authController from './controllers/authController.js';
import { sequelize } from './models/index.js';
import cors from 'cors';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });
const app = express();
const port = process.env.PORT || 3000;
// Export the app instance for testing
export default app;
// Middleware
app.use(express.json());
app.use(cors());
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
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
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
//# sourceMappingURL=app.js.map