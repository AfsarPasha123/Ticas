import { DataTypes, Model, Sequelize } from 'sequelize';

export class Space extends Model {
  public space_id!: number | null;
  public space_name!: string;
  public description!: string | null;
  public space_image!: string | null;
  public owner_id!: number;
  public products!: number[];  // Add products array
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static associate(models: any) {
    Space.belongsTo(models.User, {
      foreignKey: 'owner_id',
      as: 'owner'
    });
  }
}

export const initSpaceModel = (sequelize: Sequelize) => {
  Space.init({
    space_id: {
      type: DataTypes.INTEGER,  
      autoIncrement: true,
      primaryKey: true,
      field: 'space_id'
    },
    space_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'space_name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description'
    },
    space_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'space_image',
      defaultValue: "",
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'owner_id',
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    }
  }, {
    sequelize,
    tableName: 'spaces',
    timestamps: true,
    underscored: true
  });

  return Space;
};