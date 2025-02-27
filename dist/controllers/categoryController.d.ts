import { Request, Response } from 'express';
export declare const getAllCategories: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCategoryById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
