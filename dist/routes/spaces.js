import { Router } from 'express';
import { createSpace } from '../controllers/spaceController.js';
const router = Router();
// POST /spaces - Create a new space
router.post('/', createSpace);
export default router;
//# sourceMappingURL=spaces.js.map