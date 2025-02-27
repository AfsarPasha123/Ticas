import { Request, Response, NextFunction } from 'express';
export interface UserPayload {
    user_id: number;
    email: string;
    username?: string;
}
export interface AuthenticatedRequest extends Request {
    user?: UserPayload;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response | void>;
