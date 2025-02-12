import express from "express";
import multer from "multer";
import * as productController from "../controllers/productController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG and GIF images are allowed.")
    );
  }
};
const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.use(authenticateToken);
// Create a new product
router.post("/", upload.single("image"), productController.createProduct);

// Get all products
router.get("/", productController.getAllProducts);

// Get product by ID
router.get("/:id", productController.getProductById);

// Update a product
router.put("/:id", upload.single("image"), productController.updateProduct);

// Delete a product
router.delete("/:id", productController.deleteProduct);

export default router;
