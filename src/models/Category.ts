import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
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

export const Category = (sequelize: Sequelize, DataTypes: any) => {
    return sequelize.define<CategoryModel>(
        'Category',
        {
            category_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            category_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true
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
            tableName: 'categories',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );
};

export function initCategoryModel(sequelize: Sequelize): ModelStatic<CategoryModel> {
    return Category(sequelize, DataTypes);
}

export type { CategoryAttributes, CategoryModel };
