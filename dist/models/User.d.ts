import { Model, Sequelize } from 'sequelize';
interface UserAttributes {
    user_id: number;
    username: string;
    email?: string;
    password: string;
    phone_number?: number;
    created_at: Date;
}
interface UserCreationAttributes {
    username: string;
    email?: string;
    password: string;
    phone_number?: number;
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> {
    user_id: number;
    username: string;
    email: string;
    password: string;
    phone_number: number;
    created_at: Date;
    static associate(models: any): void;
}
export declare const initUserModel: (sequelize: Sequelize) => typeof User;
export {};
