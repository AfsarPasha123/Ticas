// src/models/Tag.ts
import { DataTypes } from 'sequelize';
export const Tag = (sequelize, DataTypes) => {
    return sequelize.define('Tag', {
        tag_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tag_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            set(value) {
                this.setDataValue('tag_name', value.toLowerCase().trim());
            }
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'tags',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['tag_name']
            }
        ]
    });
};
export const initTagModel = (sequelize) => {
    return Tag(sequelize, DataTypes);
};
//# sourceMappingURL=Tag.js.map