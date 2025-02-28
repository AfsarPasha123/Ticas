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
declare const config: Config;
export default config;
