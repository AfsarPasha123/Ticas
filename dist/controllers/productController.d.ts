import { Request, Response } from "express";
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}
interface ProductAttributes {
    product_name: string;
    description: string;
    price: number;
    space_id: number;
    primary_image_url: string;
    collection_ids: number[];
    owner_id: number;
    donation_status?: 'in_donation' | 'donated';
}
export declare const createProduct: (inputProductData: ProductAttributes, req?: Request, res?: Response) => Promise<Response<any, Record<string, any>> | import("../models/Product.js").ProductModel>;
export declare const getAllProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProductById: (req: Request, res: Response) => Promise<Response>;
export declare const getProductsByDonationStatus: (req: Request, res: Response) => Promise<Response>;
export declare const updateProduct: (req: MulterRequest, res: Response) => Promise<Response>;
export declare const deleteProduct: (req: Request, res: Response) => Promise<Response>;
export {};
