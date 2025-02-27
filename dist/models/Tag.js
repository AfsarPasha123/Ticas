import { DataTypes } from 'sequelize';
export const Tag = (sequelize, DataTypes) => {
    return sequelize.define('Tag', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tags',
        timestamps: false
    });
};
export const initTagModel = (sequelize) => {
    return Tag(sequelize, DataTypes);
};
//# sourceMappingURL=Tag.js.map