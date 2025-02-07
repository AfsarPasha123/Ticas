import { DataTypes } from 'sequelize';
export const initProductModel = (sequelize) => {
    const Product = sequelize.define('Product', {
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
    }, {
        tableName: 'products',
        timestamps: false,
    });
    return Product;
};
//# sourceMappingURL=Product.js.map