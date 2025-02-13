import express, { RequestHandler } from 'express';
import * as ProfileController from "../controllers/profileController.js";
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();

router.put("/update-password", authenticateToken as RequestHandler, ProfileController.updatePassword as RequestHandler);

router.put("/update-profile", authenticateToken as RequestHandler,  ProfileController.updateProfile as RequestHandler);

export default router;