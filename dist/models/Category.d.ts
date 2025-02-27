import { Model, ModelStatic, Sequelize } from 'sequelize';
import { TagModel } from './Tag.js';
interface CategoryAttributes {
    category_id?: number;
    category_name: string;
    created_at?: Date;
    updated_at?: Date;
    tags?: TagModel[];
}
interface CategoryModel extends Model<CategoryAttributes>, CategoryAttributes {
    addTags: (tags: TagModel | TagModel[]) => Promise<any>;
    setTags: (tags: TagModel | TagModel[]) => Promise<any>;
    getTags: () => Promise<TagModel[]>;
    removeTag: (tag: TagModel) => Promise<any>;
    removeTags: (tags: TagModel[]) => Promise<any>;
}
export declare const Category: (sequelize: Sequelize, DataTypes: any) => import("sequelize").ModelCtor<CategoryModel>;
export declare function initCategoryModel(sequelize: Sequelize): ModelStatic<CategoryModel>;
export type { CategoryAttributes, CategoryModel };
