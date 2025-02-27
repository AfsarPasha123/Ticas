import { Model, ModelStatic, Sequelize } from 'sequelize';
interface ProductAttributes {
    product_id?: number;
    product_name: string;
    description: string;
    primary_image_url?: string;
    price: number;
    owner_id: number;
    space_id?: number;
    collection_ids?: number[];
    donation_status?: 'in_donation' | 'donated';
    created_at?: Date;
    updated_at?: Date;
}
interface ProductModel extends Model<ProductAttributes>, ProductAttributes {
}
export declare const Product: (sequelize: Sequelize, DataTypes: any) => import("sequelize").ModelCtor<ProductModel>;
export declare const initProductModel: (sequelize: Sequelize) => ModelStatic<ProductModel>;
export type { ProductAttributes, ProductModel };
