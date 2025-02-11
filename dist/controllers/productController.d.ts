import { Request, Response } from "express";
export declare const createProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProductById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
