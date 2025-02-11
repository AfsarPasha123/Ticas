interface UserPayload {
    user_id: number;
    email: string;
    username?: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}
export {};
