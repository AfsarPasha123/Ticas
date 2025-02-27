import { Request, Response } from 'express';
export declare const moveProductToDonation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markProductAsDonated: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDonationProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDonatedProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
