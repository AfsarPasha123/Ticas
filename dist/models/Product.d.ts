import { Model, ModelStatic, Sequelize } from 'sequelize';
import { TagModel } from './Tag';
interface ProductAttributes {
    product_id?: number;
    product_name: string;
    description: string;
    primary_image_url?: string;
    price: number;
    owner_id: number;
    space_id?: number;
    collection_ids?: number[];
    created_at?: Date;
    updated_at?: Date;
}
interface ProductModel extends Model<ProductAttributes>, ProductAttributes {
    tags?: TagModel[];
    addTags: (tagIds: number[]) => Promise<void>;
    setTags: (tagIds: number[]) => Promise<void>;
}
export declare const Product: (sequelize: Sequelize, DataTypes: any) => ModelStatic<ProductModel>;
export declare const initProductModel: (sequelize: Sequelize) => ModelStatic<ProductModel>;
export type { ProductAttributes, ProductModel };
