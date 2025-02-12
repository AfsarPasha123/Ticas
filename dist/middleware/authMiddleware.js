import jwt from 'jsonwebtoken';
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import config from '../config/environment.js';
import { User } from '../models/User.js';
export const authenticateToken = async (req, res, next) => {
    console.log('Authentication Middleware Triggered');
    console.log('Request Headers:', req.headers);
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Extracted Token:', token);
    if (!token) {
        console.error('No token provided');
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED
        });
    }
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        console.log('Decoded Token:', decoded);
        // Verify that the user exists in the database
        const user = await User.findByPk(decoded.user_id);
        if (!user) {
            console.error(`User ${decoded.user_id} from token not found in database`);
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.AUTH.INVALID_TOKEN
            });
        }
        // Attach user information to the request
        req.user = {
            user_id: user.user_id,
            email: user.email,
            username: user.username || ''
        };
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