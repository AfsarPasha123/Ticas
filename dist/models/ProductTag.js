// src/models/ProductTag.ts
import { DataTypes } from 'sequelize';
export const ProductTag = (sequelize, DataTypes) => {
    return sequelize.define('ProductTag', {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'products',
                key: 'product_id'
            }
        },
        tag_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'tags',
                key: 'tag_id'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: 'product_tags',
        timestamps: false,
    });
};
export const initProductTagModel = (sequelize) => {
    return ProductTag(sequelize, DataTypes);
};
//# sourceMappingURL=ProductTag.js.map