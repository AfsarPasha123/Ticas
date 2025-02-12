import { Request, Response } from 'express';
interface AuthRequest extends Request {
    body: {
        username: string;
        email?: string;
        password: string;
        phone_number?: number;
    };
}
export declare const login: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const register: (req: AuthRequest, res: Response) => Promise<Response>;
export {};
