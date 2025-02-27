import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
export declare const getAllTags: (_req: Request, res: Response) => Promise<Response>;
export declare const createTag: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const deleteTag: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const searchTags: (req: Request, res: Response) => Promise<Response>;
export declare const getSuggestedTags: (_req: Request, res: Response) => Promise<Response>;
export declare const getPopularTags: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
