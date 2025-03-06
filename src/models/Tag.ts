// src/models/Tag.ts
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { ProductModel } from './Product.js';

interface TagAttributes {
    tag_id?: number;
    tag_name: string;
    created_at?: Date;
    updated_at?: Date;
    Products?: ProductModel[]; 
}

interface TagModel extends Model<TagAttributes>, TagAttributes {}

export const Tag = (sequelize: Sequelize, DataTypes: any) => {
    return sequelize.define<TagModel>(
        'Tag',
        {
            tag_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            tag_name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                set(value: string) {
                    this.setDataValue('tag_name', value.toLowerCase().trim());
                }
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'tags',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                {
                    unique: true,
                    fields: ['tag_name']
                }
            ]
        }
    ) as ModelStatic<TagModel>;
};

export const initTagModel = (sequelize: Sequelize): ModelStatic<TagModel> => {
    return Tag(sequelize, DataTypes);
};

export type { TagAttributes, TagModel };