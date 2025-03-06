// src/models/ProductTag.ts
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

interface ProductTagAttributes {
    product_id: number;
    tag_id: number;
    created_at?: Date;
}

interface ProductTagModel extends Model<ProductTagAttributes>, ProductTagAttributes {}

export const ProductTag = (sequelize: Sequelize, DataTypes: any) => {
    return sequelize.define<ProductTagModel>(
        'ProductTag',
        {
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
        },
        {
            tableName: 'product_tags',
            timestamps: false,
        }
    ) as ModelStatic<ProductTagModel>;
};

export const initProductTagModel = (sequelize: Sequelize): ModelStatic<ProductTagModel> => {
    return ProductTag(sequelize, DataTypes);
};

export type { ProductTagAttributes, ProductTagModel };