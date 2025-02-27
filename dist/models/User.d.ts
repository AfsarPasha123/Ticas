import { Model, Sequelize } from 'sequelize';
interface UserAttributes {
    user_id: number;
    username: string;
    email?: string;
    password: string;
    phone_number?: number;
    created_at: Date;
    profile_image?: string | null;
}
interface UserCreationAttributes {
    username: string;
    email?: string;
    password: string;
    phone_number?: number;
    profile_image?: string | null;
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> {
    user_id: number;
    username: string;
    email: string;
    password: string;
    phone_number: number;
    profile_image?: string | null;
    created_at: Date;
    static associate(models: any): void;
}
export declare const initUserModel: (sequelize: Sequelize) => typeof User;
export {};
