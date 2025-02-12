import express from 'express';
import * as collectionController from '../controllers/collectionController.js';
import { upload } from '../controllers/collectionController.js';
const router = express.Router();
// Comprehensive logging middleware
router.use((_req, _res, next) => {
    console.log('==================== COLLECTION ROUTE DEBUG ====================');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', _req.method);
    console.log('Path:', _req.path);
    console.log('Headers:', JSON.stringify(_req.headers, null, 2));
    console.log('Body:', JSON.stringify(_req.body, null, 2));
    console.log('================================================================');
    next();
});
// Create a new collection with image upload
router.post('/', upload.single('collection_image'), collectionController.createCollection);
// Get collection details
router.get('/:id', collectionController.getCollectionDetails);
// Get all products in a collection
router.get('/:id/products', collectionController.getCollectionProducts);
// Get collections for a user
router.get('/user/collections', collectionController.getUserCollections);
export default router;
//# sourceMappingURL=collectionRoutes.js.map