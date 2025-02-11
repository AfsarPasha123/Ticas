import { Request, Response, NextFunction } from "express";
export interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
        user_id: number;
        username: string;
    };
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
