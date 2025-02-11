import express from "express";
import * as collectionController from "../controllers/collectionController.js";

const router = express.Router();

// Comprehensive logging middleware
router.use((req, _res, next) => {
  console.log(
    "==================== COLLECTION ROUTE DEBUG ===================="
  );
  console.log("Timestamp:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log(
    "================================================================"
  );
  next();
});

// Create a new collection
router.post("/", collectionController.createCollection);

// Get collection details
router.get("/:id/details", collectionController.getCollectionDetails);

// Get products in a collection
router.get("/:id/products", collectionController.getCollectionProducts);

// Get user collections
router.get("/", collectionController.getUserCollections);

// Generate test collection data (only for development)
router.post(
  "/generate-test-data",
  collectionController.generateTestCollectionData
);

export default router;
