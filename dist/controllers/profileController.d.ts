import { Response, Request } from 'express';
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
}
export declare const updatePassword: (req: UpdatePasswordRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProfile: (req: UpdateProfileRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
