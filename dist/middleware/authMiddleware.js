import jwt from 'jsonwebtoken';
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import config from '../config/environment.js';
import { User } from '../models/User.js';
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED
        });
    }
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        // Verify that the user exists in the database
        const user = await User.findByPk(decoded.user_id);
        if (!user) {
            console.error(`User ${decoded.user_id} from token not found in database`);
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: RESPONSE_TYPES.ERROR,
                message: 'Invalid user token'
            });
        }
        console.log('User authenticated:', {
            user_id: decoded.user_id,
            email: decoded.email,
            username: decoded.username
        });
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.AUTH.INVALID_TOKEN
        });
    }
};
//# sourceMappingURL=authMiddleware.js.map