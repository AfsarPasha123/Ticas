import { Request, Response } from 'express';
export declare const moveToDonation: (req: Request, res: Response) => Promise<Response>;
export declare const donateProducts: (req: Request, res: Response) => Promise<Response>;
export declare const getInDonationProducts: (req: Request, res: Response) => Promise<Response>;
export declare const getDonatedProducts: (req: Request, res: Response) => Promise<Response>;
export declare const getDonationStatus: (req: Request, res: Response) => Promise<Response>;
