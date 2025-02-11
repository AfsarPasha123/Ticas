// import type { Request } from 'express';

// Define the structure of the user object
interface UserPayload {
  user_id: number;
  email: string;
  username: string; // Added username property
  // Add other user properties as needed
}

// Augment the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export {}; // This file is a module for type augmentation
