import express, { Router } from 'express';
import type { RequestHandler } from 'express';
import { createSpace, getSpaceById, getUserSpaces, upload } from '../controllers/spaceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const router: Router = express.Router();

// Protected routes - require authentication
router.use(authenticateToken as RequestHandler);

// Test S3 access
router.get('/test-s3', async (_req, res) => {
    try {
        const s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1'
        });
        
        // Try to list buckets - this will fail if we don't have proper access
        const command = new ListBucketsCommand({});
        const response = await s3Client.send(command);
        
        return res.status(200).json({
            message: 'Successfully connected to S3',
            buckets: response.Buckets?.map(b => b.Name)
        });
    } catch (error) {
        console.error('S3 Test Error:', error);
        return res.status(500).json({
            message: 'Failed to connect to S3',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route for creating a space with image upload
router.post('/', 
  upload.single('space_image') as RequestHandler,
  createSpace as RequestHandler
);

// Get routes
router.get('/user', getUserSpaces as RequestHandler);
router.get('/:id', getSpaceById as RequestHandler);

export default router;
