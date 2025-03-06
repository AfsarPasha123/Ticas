// src/routes/tagRoutes.ts
import express from 'express';
import { tagController } from '../controllers/tagController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();
// Get all tags (authenticated)
router.get('/', authenticateToken, tagController.getAllTags);
// Create a new tag (authenticated)
router.post('/', authenticateToken, tagController.createTag);
// Update an existing tag (authenticated)
router.put('/:tag_id', authenticateToken, tagController.updateTag);
// Delete a tag (authenticated)
router.delete('/:tag_id', authenticateToken, tagController.deleteTag);
export default router;
//# sourceMappingURL=tagRoutes.js.map