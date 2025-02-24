import * as ProfileController from "../controllers/profileController.js";
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from "../controllers/profileController.js";
const router = express.Router();
router.get("/", authenticateToken, ProfileController.getProfile);
router.put("/update-password", authenticateToken, ProfileController.updatePassword);
router.put("/update-profile", authenticateToken, upload.single("profile_image"), ProfileController.updateProfile);
export default router;
//# sourceMappingURL=profileRoutes.js.map