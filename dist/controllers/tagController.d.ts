import { Request, Response } from 'express';
export declare const tagController: {
    getAllTags(_req: Request, res: Response): Promise<void>;
    createTag(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateTag(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteTag(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
