import { DataTypes, Model, Sequelize } from 'sequelize';

interface UserAttributes {
  user_id: number;
  username: string; // This stores the username
  email?: string;
  password: string;
  phone_number?: number;
  created_at: Date;
  profile_image?: string | null;
}

interface UserCreationAttributes {
  username: string; // This stores the username
  email?: string;
  password: string;
  phone_number?: number;
  profile_image?: string | null;
}

export class User extends Model<UserAttributes, UserCreationAttributes> {
  declare user_id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare phone_number: number;
  declare profile_image?: string | null;
  declare created_at: Date;

  // Add any additional methods here
  public static associate(models: any) {
    User.hasMany(models.Space, {
      foreignKey: 'owner_id',
      as: 'spaces'
    });
  }
}

export const initUserModel = (sequelize: Sequelize) => {
  User.init({
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: true,
    },
    profile_image: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: "profile_image",
      defaultValue: "",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  });

  return User;
};
