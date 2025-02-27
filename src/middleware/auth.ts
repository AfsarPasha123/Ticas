import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  RESPONSE_TYPES,
} from "../constants/responseConstants.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    user_id: number;
    email: string;
    username?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED,
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: number;
      email: string;
      username?: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.AUTH.INVALID_TOKEN,
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }
};
