import { DataTypes } from 'sequelize';
export const CategoryTag = (sequelize, DataTypes) => {
    return sequelize.define('CategoryTag', {
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
    }, {
        tableName: 'category_tags',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });
};
export function initCategoryTagModel(sequelize) {
    return CategoryTag(sequelize, DataTypes);
}
//# sourceMappingURL=CategoryTag.js.map