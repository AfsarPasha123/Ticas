import express from 'express';
import * as ProfileController from "../controllers/profileController.js";
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get("/", authenticateToken, ProfileController.getProfile);
router.put("/update-password", authenticateToken, ProfileController.updatePassword);
router.put("/update-profile", authenticateToken, ProfileController.updateProfile);
export default router;
//# sourceMappingURL=profileRoutes.js.map