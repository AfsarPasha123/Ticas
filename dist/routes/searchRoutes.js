import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { searchAll } from "../controllers/searchController.js";
const router = express.Router();
// Search across products, spaces, and collections
router.get("/", authenticateToken, searchAll);
// Ensure proper error handling
router.use((err, _req, res, next) => {
    console.error('Search route error:', err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({
        type: "error",
        message: "Search operation failed",
        error: err.message
    });
});
export default router;
//# sourceMappingURL=searchRoutes.js.map