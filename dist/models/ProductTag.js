import { DataTypes } from 'sequelize';
export const ProductTag = (sequelize, DataTypes) => {
    return sequelize.define('ProductTag', {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'products',
                key: 'product_id'
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
        tableName: 'product_tags',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });
};
export const initProductTagModel = (sequelize) => {
    return ProductTag(sequelize, DataTypes);
};
//# sourceMappingURL=ProductTag.js.map