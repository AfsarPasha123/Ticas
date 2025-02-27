import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import config from '../config/environment.js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Use default credential provider
const s3Client = new S3Client({
    region: config.aws.region,
    // This will automatically use:
    // 1. Environment variables
    // 2. AWS CLI credentials
    // 3. EC2/ECS/Lambda instance metadata
});

// Log the current AWS credentials
s3Client.config.credentials().then(creds => {
    console.log('AWS Credentials loaded:', {
        accessKeyId: creds.accessKeyId,
        expiration: creds.expiration,
        type: creds.constructor.name
    });
}).catch(error => {
    console.error('Error loading AWS credentials:', error);
});

export const uploadToS3 = async (file: Express.Multer.File, key: string): Promise<string> => {
    try {
        console.log('Starting S3 upload:', {
            key,
            contentType: file.mimetype,
            size: file.size
        });

        if (!file.buffer) {
            throw new Error('File buffer is missing');
        }

        const params = {
            Bucket: config.aws.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        console.log('Sending PutObject command to S3:', {
            bucket: params.Bucket,
            key: params.Key,
            contentType: params.ContentType
        });

        await s3Client.send(new PutObjectCommand(params));
        const url = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
        
        console.log('S3 upload successful:', {
            url,
            key
        });

        return await getSignedDownloadUrl(key);
    } catch (error) {
        console.error('S3 upload error:', {
            error,
            key,
            bucket: config.aws.bucketName,
            region: config.aws.region
        });
        throw error;
    }
};

export const getSignedDownloadUrl = async (key: string): Promise<string> => {
    try {
        console.log('Getting signed URL for:', {
            key,
            bucket: config.aws.bucketName
        });

        const command = new GetObjectCommand({
            Bucket: config.aws.bucketName,
            Key: key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        console.log('Generated signed URL:', {
            key,
            expiresIn: '1 hour'
        });

        return url;
    } catch (error) {
        console.error('Error generating signed URL:', {
            error,
            key,
            bucket: config.aws.bucketName
        });
        throw error;
    }
};

export const deleteFromS3 = async (key: string): Promise<void> => {
    try {
        console.log('Deleting object from S3:', {
            key,
            bucket: config.aws.bucketName
        });

        const command = new DeleteObjectCommand({
            Bucket: config.aws.bucketName,
            Key: key,
        });

        await s3Client.send(command);
        
        console.log('Successfully deleted object from S3:', {
            key,
            bucket: config.aws.bucketName
        });
    } catch (error) {
        console.error('Error deleting from S3:', {
            error,
            key,
            bucket: config.aws.bucketName
        });
        throw error;
    }
};
