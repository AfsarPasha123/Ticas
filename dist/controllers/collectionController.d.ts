import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { Response } from "express";
import multer from "multer";
export declare const upload: multer.Multer;
interface CollectionRequest extends AuthenticatedRequest {
    body: {
        collection_name: string;
        description: string;
    };
    file?: Express.Multer.File;
}
export declare const createCollection: (req: CollectionRequest, res: Response) => Promise<Response>;
export declare const getCollectionDetails: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const getCollectionProducts: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const getUserCollections: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const getProductCollections: (req: any, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
