export declare const uploadToS3: (file: Express.Multer.File, key: string) => Promise<string>;
export declare const getSignedDownloadUrl: (key: string) => Promise<string>;
export declare const deleteFromS3: (key: string) => Promise<void>;
