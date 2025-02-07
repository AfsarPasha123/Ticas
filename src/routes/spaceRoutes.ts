import express from 'express';
import { createSpace, getSpaceById, getUserSpaces, upload } from '../controllers/spaceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticateToken);

// Route for creating a space with image upload
router.post('/create', upload.single('space_image'), createSpace);

router.get('/:id', getSpaceById);
router.get('/user/spaces', getUserSpaces);

export default router;
