import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

interface CategoryTagAttributes {
    category_id: number;
    tag_id: number;
    created_at?: Date;
}

interface CategoryTagModel extends Model<CategoryTagAttributes>, CategoryTagAttributes {}

export const CategoryTag = (sequelize: Sequelize, DataTypes: any) => {
    return sequelize.define<CategoryTagModel>(
        'CategoryTag',
        {
            category_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: {
                    model: 'categories',
                    key: 'category_id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            tag_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                references: {
                    model: 'tags',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            tableName: 'category_tags',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false
        }
    );
};

export function initCategoryTagModel(sequelize: Sequelize): ModelStatic<CategoryTagModel> {
    return CategoryTag(sequelize, DataTypes);
}

export type { CategoryTagAttributes, CategoryTagModel };
