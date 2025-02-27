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
        },
        donation_status: {
            type: DataTypes.ENUM('in_donation', 'donated'),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            field: 'created_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            field: 'updated_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'products',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
};
export const initProductModel = (sequelize) => {
    return Product(sequelize, DataTypes);
};
//# sourceMappingURL=Product.js.map