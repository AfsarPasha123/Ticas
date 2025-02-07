import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import multer from 'multer';
export declare const upload: multer.Multer;
interface SpaceRequest extends AuthenticatedRequest {
    body: {
        space_name: string;
        description: string;
    };
    file?: Express.Multer.File;
}
export declare const createSpace: (req: SpaceRequest, res: Response) => Promise<Response>;
export declare const getSpaceById: (req: SpaceRequest, res: Response) => Promise<Response>;
export declare const getUserSpaces: (req: SpaceRequest, res: Response) => Promise<Response>;
export {};
