import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface ProductAttributes {
    product_id?: number;
    product_name: string;
    description: string;
    primary_image_url?: string;
    price: number;
    owner_id: number;
    space_id?: number;
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
                defaultValue: '',
            },
            primary_image_url: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: '',
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
            collection_ids: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                get() {
                    const value = this.getDataValue('collection_ids');
                    return value ? (typeof value === 'string' ? JSON.parse(value) : value) : [];
                },
                set(value: number[]) {
                    this.setDataValue('collection_ids', Array.isArray(value) ? value : []);
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
