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
        },
        primary_image_url: {
            type: DataTypes.STRING,
            allowNull: true,
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