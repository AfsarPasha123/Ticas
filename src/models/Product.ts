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
    updated_at?: Date;
}

interface ProductModel extends Model<ProductAttributes>, ProductAttributes {}

export const Product = (sequelize: Sequelize, DataTypes: any) => {
    return sequelize.define<ProductModel>(
        'Product',
        {
            product_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            product_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            primary_image_url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            secondary_image_url: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
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
                allowNull: true,
            },
            collection_ids: {
                type: DataTypes.ARRAY(DataTypes.INTEGER),
                allowNull: true,
            },
        },
        {
            tableName: 'products',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    ) as ModelStatic<ProductModel>;
};

export const initProductModel = (sequelize: Sequelize): ModelStatic<ProductModel> => {
    return Product(sequelize, DataTypes);
};

export type { ProductAttributes, ProductModel };
