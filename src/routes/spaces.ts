import { Router, RequestHandler } from 'express';
import { createSpace } from '../controllers/spaceController.js';

const router = Router();

// POST /spaces - Create a new space
router.post('/', createSpace as RequestHandler);

export default router;
