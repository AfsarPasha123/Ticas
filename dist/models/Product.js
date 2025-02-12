import { DataTypes } from 'sequelize';
export const Product = (sequelize, DataTypes) => {
    return sequelize.define('Product', {
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
            set(value) {
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
    }, {
        tableName: 'products',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
};
export const initProductModel = (sequelize) => {
    return Product(sequelize, DataTypes);
};
//# sourceMappingURL=Product.js.map