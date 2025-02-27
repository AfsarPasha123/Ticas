import express, { RequestHandler } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import * as tagController from "../controllers/tagController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as RequestHandler);

// Get all tags
router.get("/", tagController.getAllTags as RequestHandler);

// Get suggested/popular tags
router.get("/suggested", tagController.getSuggestedTags as RequestHandler);

// Get popular tags based on usage
router.get("/popular", tagController.getPopularTags as RequestHandler);

// Create a new tag
router.post("/", tagController.createTag as RequestHandler);

// Delete a tag
router.delete("/:id", tagController.deleteTag as RequestHandler);

// Search tags
router.get("/search", tagController.searchTags as RequestHandler);

export default router;
