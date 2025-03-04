import * as collectionController from "../controllers/collectionController.js";
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from "../constants/responseConstants.js";
import express from "express";
import { authenticateToken } from '../middleware/authMiddleware.js';
import { updateCollection, upload, deleteCollection } from '../controllers/collectionController.js';
const router = express.Router();
// Comprehensive logging middleware
router.use((req, _res, next) => {
    console.log("==================== COLLECTION ROUTE DEBUG ====================");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Method:", req.method);
    console.log("Path:", req.path);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("================================================================");
    next();
});
router.use(authenticateToken);
// Create a new collection with image upload
router.post("/", upload.single("collection_image"), 
// Post-multer body validation
(req, res, next) => {
    console.log("Post-multer body validation:", req.body);
    if (!req.body || !req.body.collection_name) {
        return res.status(400).json({
            status: HTTP_STATUS.BAD_REQUEST,
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INVALID_REQUEST,
            details: { collection_name: "Collection name is required" },
        });
    }
    next();
}, collectionController.createCollection);
// Get collection details
router.get("/:id", collectionController.getCollectionDetails);
// Get all products exist in a collection
router.get("/:id/products", collectionController.getCollectionProducts);
// Get collections for a user
router.get("/user/collections", collectionController.getUserCollections);
// Get all collections that a product exist in.
router.get("/product/:id", collectionController.getProductCollections);
router.put('/:id', authenticateToken, upload.single('collection_image'), updateCollection);
router.delete("/:id", authenticateToken, deleteCollection);
export default router;
//# sourceMappingURL=collectionRoutes.js.map