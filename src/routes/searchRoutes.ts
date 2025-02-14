import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { searchAll } from "../controllers/searchController.js";

const router = express.Router();
router.get("/", authenticateToken, searchAll);

export default router;
