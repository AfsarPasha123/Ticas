import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

interface ProductAttributes {
    product_id?: number;
    product_name: string;
    description?: string;
    primary_image_url: string;
    price?: number;
    owner_id: number;
    space_id?: number;
    collection_ids?: number[];
    created_at?: Date;
    updated_at?: Date;
    donation_status?: 'in_donation' | 'donated' | null; // New field for donation status
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
                allowNull: true,
                defaultValue: '',
            },
            primary_image_url: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: '',
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            owner_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            space_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
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
            donation_status: { // New field for donation status
                type: DataTypes.ENUM('in_donation', 'donated'),
                allowNull: true,
                defaultValue: null,
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