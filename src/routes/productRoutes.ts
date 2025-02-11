import express from 'express';
import multer from 'multer';
import * as productController from '../controllers/productController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Create a new product
router.post('/', upload.single('image'), productController.createProduct);

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Update a product
router.put('/:id', upload.single('image'), productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

export default router;
