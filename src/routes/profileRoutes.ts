import * as ProfileController from "../controllers/profileController.js";

import express, { RequestHandler } from 'express';

import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from "../controllers/profileController.js"
const router = express.Router();

router.get("/", authenticateToken as RequestHandler, ProfileController.getProfile as RequestHandler);

router.put("/update-password", authenticateToken as RequestHandler, ProfileController.updatePassword as RequestHandler);

router.put("/update-profile", authenticateToken as RequestHandler, upload.single("profile_image"),
  ProfileController.updateProfile as RequestHandler);

export default router;