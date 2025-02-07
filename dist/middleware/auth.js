import jwt from 'jsonwebtoken';
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.AUTH.INVALID_TOKEN
        });
    }
};
//# sourceMappingURL=auth.js.map