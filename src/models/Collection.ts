import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Interface for Collection attributes
interface CollectionAttributes {
  collection_id: number;
  collection_name: string;
  description?: string;
  owner_id: number;
  last_updated?: Date;
}

// Interface for Collection creation
interface CollectionCreationAttributes extends Optional<CollectionAttributes, 'collection_id' | 'description' | 'last_updated'> {}

// Define the Collection model
class Collection extends Model<CollectionAttributes, CollectionCreationAttributes> implements CollectionAttributes {
  public collection_id!: number;
  public collection_name!: string;
  public description?: string;
  public owner_id!: number;
  public last_updated?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Collection model
export const initCollectionModel = (sequelize: Sequelize) => {
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

export { Collection, CollectionAttributes, CollectionCreationAttributes };
