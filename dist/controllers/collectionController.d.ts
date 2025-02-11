import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
export declare const createCollection: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const getCollectionDetails: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const getCollectionProducts: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const getUserCollections: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
