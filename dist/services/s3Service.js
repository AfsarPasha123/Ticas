import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config/environment.js';
const s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
    }
});
export const uploadToS3 = async (file, key) => {
    try {
        if (!file.buffer) {
            throw new Error('File buffer is missing');
        }
        const params = {
            Bucket: config.aws.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        };
        await s3Client.send(new PutObjectCommand(params));
        return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
    }
    catch (error) {
        console.error('S3 upload error:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            bucket: config.aws.bucketName,
            region: config.aws.region,
            key
        });
        throw error;
    }
};
export const getSignedDownloadUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: config.aws.bucketName,
        Key: key
    });
    try {
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }
    catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
};
export const deleteFromS3 = async (key) => {
    try {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: config.aws.bucketName,
            Key: key
        }));
    }
    catch (error) {
        console.error('Error deleting from S3:', error);
        throw error;
    }
};
//# sourceMappingURL=s3Service.js.map