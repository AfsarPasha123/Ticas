import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import "../types.js";
export declare const createCollection: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCollectionDetails: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCollectionProducts: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserCollections: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateTestCollectionData: (_req: AuthenticatedRequest, _res: Response) => Promise<void>;
