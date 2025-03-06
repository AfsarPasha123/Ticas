import { Model, ModelStatic, Sequelize } from 'sequelize';
interface ProductTagAttributes {
    product_id: number;
    tag_id: number;
    created_at?: Date;
}
interface ProductTagModel extends Model<ProductTagAttributes>, ProductTagAttributes {
}
export declare const ProductTag: (sequelize: Sequelize, DataTypes: any) => ModelStatic<ProductTagModel>;
export declare const initProductTagModel: (sequelize: Sequelize) => ModelStatic<ProductTagModel>;
export type { ProductTagAttributes, ProductTagModel };
