import { Model, Optional, Sequelize } from 'sequelize';
interface CollectionAttributes {
    collection_id: number;
    collection_name: string;
    description?: string;
    collection_image?: string | null;
    owner_id: number;
    last_updated?: Date;
}
interface CollectionCreationAttributes extends Optional<CollectionAttributes, 'collection_id' | 'description' | 'collection_image' | 'last_updated'> {
}
declare class Collection extends Model<CollectionAttributes, CollectionCreationAttributes> implements CollectionAttributes {
    collection_id: number;
    collection_name: string;
    description?: string;
    collection_image?: string | null;
    owner_id: number;
    last_updated?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export declare const initCollectionModel: (sequelize: Sequelize) => typeof Collection;
export { Collection, CollectionAttributes, CollectionCreationAttributes };
