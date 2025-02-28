import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: {
      user_id: number;
      email: string;
      username?: string;
    };
  }
}