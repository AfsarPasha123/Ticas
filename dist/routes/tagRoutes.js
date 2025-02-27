import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import * as tagController from "../controllers/tagController.js";
const router = express.Router();
// Apply authentication middleware to all routes
router.use(authenticateToken);
// Get all tags
router.get("/", tagController.getAllTags);
// Get suggested/popular tags
router.get("/suggested", tagController.getSuggestedTags);
// Get popular tags based on usage
router.get("/popular", tagController.getPopularTags);
// Create a new tag
router.post("/", tagController.createTag);
// Delete a tag
router.delete("/:id", tagController.deleteTag);
// Search tags
router.get("/search", tagController.searchTags);
export default router;
//# sourceMappingURL=tagRoutes.js.map