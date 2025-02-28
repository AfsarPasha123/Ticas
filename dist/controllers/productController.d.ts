import { Request, Response } from "express";
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}
export declare const createProduct: (req: MulterRequest, res: Response) => Promise<Response>;
export declare const getAllProducts: (_req: Request, res: Response) => Promise<Response>;
export declare const getProductById: (req: Request, res: Response) => Promise<Response>;
export declare const updateProduct: (req: MulterRequest, res: Response) => Promise<Response>;
export declare const deleteProduct: (req: Request, res: Response) => Promise<Response>;
export {};
