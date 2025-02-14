import express, {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import * as collectionController from "../controllers/collectionController.js";
import { upload } from "../controllers/collectionController.js";
import { authenticateToken } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

// Comprehensive logging middleware
router.use((_req: Request, _res: Response, next: NextFunction) => {
  console.log(
    "==================== COLLECTION ROUTE DEBUG ===================="
  );
  console.log("Timestamp:", new Date().toISOString());
  console.log("Method:", _req.method);
  console.log("Path:", _req.path);
  console.log("Headers:", JSON.stringify(_req.headers, null, 2));
  console.log("Body:", JSON.stringify(_req.body, null, 2));
  console.log(
    "================================================================"
  );
  next();
});
router.use(authenticateToken as RequestHandler);
// Create a new collection with image upload
router.post(
  "/",
  upload.single("collection_image"),
  collectionController.createCollection as RequestHandler
);

// Get collection details
router.get("/:id", collectionController.getCollectionDetails as RequestHandler);

// Get all products in a collection
router.get(
  "/:id/products",
  collectionController.getCollectionProducts as RequestHandler
);

// Get collections for a user
router.get(
  "/user/collections",
  collectionController.getUserCollections as RequestHandler
);

// Get all collections that a product exist in.
router.get(
  "/product/:id",
  collectionController.getProductCollections as RequestHandler
);

export default router;


