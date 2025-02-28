import express from 'express';
import * as donationController from '../controllers/donationcontroller.js'; // Import the donation controller
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();
// Apply authentication middleware to all routes
router.use(authenticateToken);
// Route to move products to donation
router.post('/move-to-donation', donationController.moveToDonation);
// Route to mark products as donated
router.post('/donate', donationController.donateProducts);
// New route to retrieve products that are in the donation process
router.get('/in-donation', donationController.getInDonationProducts);
// New route to retrieve products that have been donated
router.get('/donated', donationController.getDonatedProducts);
export default router;
//# sourceMappingURL=donationRoutes.js.map