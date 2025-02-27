export interface Space {
  space_id?: number;
  space_name: string;
  description?: string;
  owner_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface User {
  user_id?: number;
  email: string;
  password: string;
  phone_number: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

export interface CustomRequest extends Request {
  user?: {
    user_id: number;
    username: string;
    email: string;
  };
}
