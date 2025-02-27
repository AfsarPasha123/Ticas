import { Model, ModelStatic, Sequelize } from 'sequelize';
interface CategoryTagAttributes {
    category_id: number;
    tag_id: number;
    created_at?: Date;
}
interface CategoryTagModel extends Model<CategoryTagAttributes>, CategoryTagAttributes {
}
export declare const CategoryTag: (sequelize: Sequelize, DataTypes: any) => import("sequelize").ModelCtor<CategoryTagModel>;
export declare function initCategoryTagModel(sequelize: Sequelize): ModelStatic<CategoryTagModel>;
export type { CategoryTagAttributes, CategoryTagModel };
