import { Model, DataTypes } from 'sequelize';
export class Space extends Model {
    space_id;
    space_name;
    description;
    space_image;
    owner_id;
    created_at;
    // Add any additional methods here
    static associate(models) {
        Space.belongsTo(models.User, {
            foreignKey: 'owner_id',
            as: 'owner'
        });
    }
}
export const initSpaceModel = (sequelize) => {
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
            field: 'space_image'
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
        }
    }, {
        sequelize,
        tableName: 'spaces',
        timestamps: false,
        underscored: true
    });
    return Space;
};
//# sourceMappingURL=Space.js.map