import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment-specific variables
const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

export interface Config {
    env: string;
    database: {
        host: string;
        user: string;
        password: string;
        name: string;
    };
    server: {
        port: number;
    };
    jwt: {
        secret: string;
    };
    logging: {
        level: string;
    };
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        bucketName: string;
    };
}

// Log environment variables for debugging
console.log('Environment:', environment);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);

function validateConfig() {
    const requiredEnvVars = [
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'JWT_SECRET',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
        'AWS_BUCKET_NAME'
    ];

    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
}

// Validate environment variables
validateConfig();



const config: Config = {
    env: environment,
    database: {
        host: process.env.DB_HOST!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        name: process.env.DB_NAME!
    },
    server: {
        port: parseInt(process.env.PORT || '3001', 10)
    },
    jwt: {
        secret: process.env.JWT_SECRET!
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    },
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION!,
        bucketName: process.env.AWS_BUCKET_NAME!
    }
};

export default config;
