import express from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, RESPONSE_TYPES, RESPONSE_MESSAGES } from '../constants/responseConstants.js';
import { User } from '../models/User.js';
const router = express.Router();
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED
            });
        }
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
        const user = await User.findOne({ where: { user_id: decoded.user_id } });
        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.AUTH.INVALID_TOKEN
            });
        }
        const newToken = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.AUTH.TOKEN_REFRESH_SUCCESS,
            data: { token: newToken }
        });
    }
    catch (error) {
        console.error('Error refreshing token:', error);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.AUTH.INVALID_TOKEN
        });
    }
});
export default router;
//# sourceMappingURL=authRoutes.js.map