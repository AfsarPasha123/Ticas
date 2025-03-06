import { Model, ModelStatic, Sequelize, Association } from 'sequelize';
import { TagModel } from './Tag';
interface ProductAttributes {
    product_id?: number;
    product_name: string;
    description?: string;
    primary_image_url: string;
    price?: number;
    owner_id: number;
    space_id?: number | null;
    collection_ids?: number[];
    tags?: string[];
    created_at?: Date;
    updated_at?: Date;
    donation_status?: 'in_donation' | 'donated' | null;
    Tags?: TagModel[];
}
interface ProductModelStatic extends ModelStatic<ProductModel> {
    setProductTags(productId: number, tagNames: string[]): Promise<TagModel[]>;
    getProductTags(productId: number): Promise<string[]>;
    Tags: Association<ProductModel, TagModel>;
}
interface ProductModel extends Model<ProductAttributes>, ProductAttributes {
}
export declare const Product: (sequelize: Sequelize, DataTypes: any) => ProductModelStatic;
export declare const initProductModel: (sequelize: Sequelize) => ProductModelStatic;
export type { ProductAttributes, ProductModel, ProductModelStatic };
