import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
// Robust Environment Configuration
function loadEnvironmentConfig() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Determine environment
    const nodeEnv = process.env.NODE_ENV || "production";
    const envFile = `.env.${nodeEnv}`;
    const envPath = path.resolve(__dirname, `../${envFile}`);
    // Validate environment file exists
    if (!fs.existsSync(envPath)) {
        console.error(`❌ Environment file not found: ${envPath}`);
        process.exit(1);
    }
    // Load environment variables
    dotenv.config({
        path: envPath,
        debug: nodeEnv === "development",
    });
    // Validate critical environment variables
    const requiredVars = [
        "DB_HOST",
        "DB_USER",
        "DB_PASSWORD",
        "DB_NAME",
        "PORT",
        "JWT_SECRET",
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error("❌ Missing required environment variables:", missingVars);
        process.exit(1);
    }
    return {
        database: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            name: process.env.DB_NAME,
        },
        server: {
            port: Number(process.env.PORT || 3000),
            env: nodeEnv,
        },
        jwt: {
            secret: process.env.JWT_SECRET,
        },
    };
}
// Configuration
const config = loadEnvironmentConfig();
// Imports
import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
// Import routes
import spaceRoutes from "./routes/spaceRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import * as authController from "./controllers/authController.js";
// Import database
import { sequelize } from "./models/index.js";
const app = express();
const port = config.server.port;
// Middleware for parsing JSON with increased size limit and robust error handling
app.use(express.json({
    limit: "10mb",
    verify: (_req, _res, buf) => {
        try {
            JSON.parse(buf.toString());
        }
        catch (e) {
            console.error("Invalid JSON:", e);
            throw new Error("Invalid JSON");
        }
    },
}));
// Global request logging middleware with enhanced diagnostics
app.use((_req, _res, next) => {
    const startTime = Date.now();
    // Log request details
    console.log("==================== GLOBAL REQUEST DEBUG ====================");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Method:", _req.method);
    console.log("Path:", _req.path);
    console.log("Headers:", _req.headers);
    console.log("Body:", _req.body);
    // Track response time
    const oldWrite = _res.write;
    const oldEnd = _res.end;
    const chunks = [];
    _res.write = function (chunk) {
        chunks.push(Buffer.from(chunk));
        return oldWrite.apply(_res, arguments);
    };
    _res.end = function (chunk) {
        if (chunk) {
            chunks.push(Buffer.from(chunk));
        }
        const responseBody = Buffer.concat(chunks).toString("utf8");
        const responseTime = Date.now() - startTime;
        console.log("Response Time:", responseTime + "ms");
        console.log("Response Body:", responseBody);
        console.log("================================================================");
        oldEnd.apply(_res, arguments);
    };
    next();
});
// CORS configuration with security enhancements
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 3600,
}));
// Serve static files with robust path resolution
app.use("/uploads", express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads"), {
    dotfiles: "ignore",
    maxAge: "1d",
}));
// Rate limiting middleware with granular control
const createLimiter = (windowMs, max) => rateLimit({
    windowMs,
    max,
    message: { error: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
});
const generalLimiter = createLimiter(15 * 60 * 1000, 100);
const authLimiter = createLimiter(5 * 60 * 1000, 50);
// Apply rate limiting
app.use(generalLimiter);
app.use("/auth", authLimiter);
// Authentication routes
app.post("/auth/register", authController.register);
app.post("/auth/login", authController.login);
// Protected routes
app.use("/spaces", spaceRoutes);
app.use("/products", productRoutes);
app.use("/collections", collectionRoutes);
app.use("/auth", authRoutes);
// Centralized route logging
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(`Registered Route: ${Object.keys(middleware.route.methods).join(", ")} ${middleware.route.path}`);
    }
});
// Comprehensive error handling middleware
app.use((_err, _req, res, _next) => {
    console.error("Unhandled Error:", _err.stack);
    res.status(500).json({
        type: "error",
        message: "Internal Server Error",
        status: 500,
    });
});
// 404 handler with logging
app.use((_req, res) => {
    console.log("404 - Route Not Found");
    res.status(404).json({
        status: "error",
        message: "Route not found",
    });
});
// Server initialization with comprehensive error handling
async function startServer() {
    try {
        // Database connection
        await sequelize.authenticate();
        console.log("✅ Database connection established successfully.");
        // Synchronize models (optional, be cautious in production)
        if (config.server.env !== "production") {
            await sequelize.sync();
            console.log("✅ Database models synchronized.");
        }
        // Start HTTP server
        const server = app.listen(port, () => {
            console.log(`🚀 Server running in ${config.server.env} mode on port ${port}`);
        });
        // Graceful shutdown handling
        process.on("SIGTERM", () => {
            console.log("🛑 SIGTERM received. Shutting down gracefully...");
            server.close(() => {
                console.log("🔌 HTTP server closed.");
                sequelize.close().then(() => {
                    console.log("📦 Database connection closed.");
                    process.exit(0);
                });
            });
        });
    }
    catch (error) {
        console.error("❌ Unable to start server:", error);
        process.exit(1);
    }
}
// Initiate server startup
startServer();
export default app;
//# sourceMappingURL=app.js.map