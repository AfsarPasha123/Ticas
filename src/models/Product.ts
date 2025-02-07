import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface ProductAttributes {
    product_id?: number;
    product_name: string;
    description: string;
    primary_image_url: string;
    secondary_image_url?: string[];
    price: number;
    owner_id: number;
    space_id?: number;
    status?: 'Pending' | 'Completed' | 'Cancelled';
    collection_ids?: number[];
    created_at?: Date;
}

interface ProductModel extends Model<ProductAttributes>, ProductAttributes {}

export const initProductModel = (sequelize: Sequelize): ModelStatic<ProductModel> => {
    const Product = sequelize.define<ProductModel>(
        'Product',
        {
            product_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            product_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            primary_image_url: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            secondary_image_url: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            owner_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            space_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'),
                defaultValue: 'Pending',
            },
            collection_ids: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'products',
            timestamps: false,
        }
    ) as ModelStatic<ProductModel>;

    return Product;
};

export type { ProductAttributes, ProductModel };
