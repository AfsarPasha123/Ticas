import express, { Request, Response } from "express";
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

router.use(authenticateToken as any);

// Create a new product
router.post('/', upload.single('image'), async (req: Request & { user?: { user_id: number }, file?: Express.Multer.File }, res: Response) => {
    try {
      const { 
        product_name, 
        description, 
        price, 
        space_id, 
        collection_id,
        donation_status 
      } = req.body;

      // Validate inputs
      if (!product_name || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate price
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice)) {
        return res.status(400).json({ error: 'Invalid price format' });
      }

      // Validate space_id if provided
      let validatedSpaceId: number | undefined;
      if (space_id) {
        const parsedSpaceId = Number(space_id);
        if (isNaN(parsedSpaceId)) {
          return res.status(400).json({ error: 'Invalid space_id format' });
        }
        validatedSpaceId = parsedSpaceId;
      }

      // Validate user_id
      if (!req.user?.user_id) {
        return res.status(401).json({ error: 'Unauthorized: User ID not found' });
      }

      // Validate donation status
      const validDonationStatuses = ['in_donation', 'donated'];
      if (donation_status && !validDonationStatuses.includes(donation_status)) {
        return res.status(400).json({ error: 'Invalid donation status' });
      }

      // Prepare collection_ids (convert to array if exists)
      const collection_ids = collection_id ? [Number(collection_id)] : [];

      // Handle image upload
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      // Safely stringify the result to avoid circular reference
      const result = await productController.createProduct(
        {
          product_name,
          description: description || '',
          price: parsedPrice,
          space_id: validatedSpaceId || 0, // Default to 0 if not provided
          primary_image_url: '', // Will be set later in the method
          collection_ids,
          owner_id: req.user.user_id,
          donation_status: donation_status as 'in_donation' | 'donated' | undefined
        },
        req,  // Pass the entire request object
        res   // Pass the response object
      );

      // Safely send the response
      if (!res.headersSent) {
        res.status(201).json({
          type: 'success',
          message: 'Product created successfully',
          data: result
        });
      }
    } catch (error) {
      console.error('Product creation error:', error);
      // Ensure response is only sent if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).json({ 
          type: 'error',
          message: 'Failed to create product', 
          details: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
});

// Get all products
router.get("/", productController.getAllProducts);

export default router;
