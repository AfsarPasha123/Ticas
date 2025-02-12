import { Model, DataTypes } from 'sequelize';
export class User extends Model {
    // Add any additional methods here
    static associate(models) {
        User.hasMany(models.Space, {
            foreignKey: 'owner_id',
            as: 'spaces'
        });
    }
}
export const initUserModel = (sequelize) => {
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
//# sourceMappingURL=User.js.map