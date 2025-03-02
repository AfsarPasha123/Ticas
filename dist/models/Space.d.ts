import { Model, Sequelize } from 'sequelize';
export declare class Space extends Model {
    space_id: number | null;
    space_name: string;
    description: string | null;
    space_image: string | null;
    owner_id: number;
    products: number[];
    readonly created_at: Date;
    readonly updated_at: Date;
    static associate(models: any): void;
}
export declare const initSpaceModel: (sequelize: Sequelize) => typeof Space;
