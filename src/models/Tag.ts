import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

interface TagAttributes {
    id?: number;
    name: string;
    created_at?: Date;
    updated_at?: Date;
}

interface TagModel extends Model<TagAttributes>, TagAttributes {}

export const Tag = (sequelize: Sequelize, DataTypes: any) => {
    return sequelize.define<TagModel>(
        'Tag',
        {
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
        },
        {
            tableName: 'tags',
            timestamps: false
        }
    );
};

export interface TagModelInterface {
    initTagModel(sequelize: Sequelize): ModelStatic<TagModel>
}

export const initTagModel = (sequelize: Sequelize): ModelStatic<TagModel> => {
    return Tag(sequelize, DataTypes);
};

export type { TagAttributes, TagModel };
