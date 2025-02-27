import { Request, Response } from 'express';
import multer from "multer";
export declare const upload: multer.Multer;
interface UpdatePasswordRequest extends Request {
    body: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    };
}
interface UpdateProfileRequest extends Request {
    body: {
        username: string;
        phone_number: number;
    };
    file?: Express.Multer.File;
}
export declare const updatePassword: (req: UpdatePasswordRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProfile: (req: UpdateProfileRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
