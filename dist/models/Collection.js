import { DataTypes, Model } from 'sequelize';
// Define the Collection model
class Collection extends Model {
    collection_id;
    collection_name;
    description;
    collection_image;
    owner_id;
    last_updated;
    // Timestamps
    createdAt;
    updatedAt;
}
// Initialize the Collection model
export const initCollectionModel = (sequelize) => {
    Collection.init({
        collection_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        collection_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        collection_image: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        last_updated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Collection',
        tableName: 'collections',
        timestamps: true
    });
    return Collection;
};
export { Collection };
//# sourceMappingURL=Collection.js.map