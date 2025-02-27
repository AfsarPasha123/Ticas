import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { Response } from 'express';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', (req: AuthenticatedRequest, res: Response) => {
  try {
    // The user information is already attached to the request by the authenticateToken middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user data without sensitive information
    return res.status(200).json({
      user_id: user.user_id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', (_req: AuthenticatedRequest, res: Response) => {
  // This is a placeholder for the update user profile functionality
  // You would implement the actual logic here
  res.status(501).json({ message: 'Update user profile functionality not implemented yet' });
});

export default router;
