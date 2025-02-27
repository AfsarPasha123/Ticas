import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { moveProductToDonation, markProductAsDonated, getDonationProducts, getDonatedProducts } from '../controllers/donationController.js';
const router = express.Router();
// Middleware to authenticate all routes
router.use(authenticateToken);
// Move product to donation
router.post('/move', moveProductToDonation);
// Mark product as donated
router.post('/mark', markProductAsDonated);
// Get products in donation
router.get('/in-donation', getDonationProducts);
// Get donated products
router.get('/donated', getDonatedProducts);
export default router;
//# sourceMappingURL=donationRoutes.js.map