import { Model, ModelStatic, Sequelize } from 'sequelize';
import { ProductModel } from './Product.js';
interface TagAttributes {
    tag_id?: number;
    tag_name: string;
    created_at?: Date;
    updated_at?: Date;
    Products?: ProductModel[];
}
interface TagModel extends Model<TagAttributes>, TagAttributes {
}
export declare const Tag: (sequelize: Sequelize, DataTypes: any) => ModelStatic<TagModel>;
export declare const initTagModel: (sequelize: Sequelize) => ModelStatic<TagModel>;
export type { TagAttributes, TagModel };
