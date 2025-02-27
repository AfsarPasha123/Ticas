import { Model, ModelStatic, Sequelize } from 'sequelize';
interface TagAttributes {
    id?: number;
    name: string;
    created_at?: Date;
    updated_at?: Date;
}
interface TagModel extends Model<TagAttributes>, TagAttributes {
}
export declare const Tag: (sequelize: Sequelize, DataTypes: any) => import("sequelize").ModelCtor<TagModel>;
export interface TagModelInterface {
    initTagModel(sequelize: Sequelize): ModelStatic<TagModel>;
}
export declare const initTagModel: (sequelize: Sequelize) => ModelStatic<TagModel>;
export type { TagAttributes, TagModel };
