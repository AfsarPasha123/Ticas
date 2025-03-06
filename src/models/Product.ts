import { DataTypes, Model, ModelStatic, Sequelize, Association } from 'sequelize';
import { TagModel } from './Tag';  // Import the existing TagModel

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
    Tags?: TagModel[]; // Updated to match the association alias and typing
}

// Extended interface to include static methods
interface ProductModelStatic extends ModelStatic<ProductModel> {
    setProductTags(productId: number, tagNames: string[]): Promise<TagModel[]>;
    getProductTags(productId: number): Promise<string[]>;
    Tags: Association<ProductModel, TagModel>; // Added typing for the Tags association
}

interface ProductModel extends Model<ProductAttributes>, ProductAttributes {
    // Existing interface remains the same
}

export const Product = (sequelize: Sequelize, DataTypes: any) => {
    const ProductModel = sequelize.define<ProductModel>(
        'Product',
        {
            product_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            product_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: '',
            },
            primary_image_url: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: '',
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            owner_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            space_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            collection_ids: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                get() {
                    const value = this.getDataValue('collection_ids');
                    return value ? (typeof value === 'string' ? JSON.parse(value) : value) : [];
                },
                set(value: number[]) {
                    this.setDataValue('collection_ids', Array.isArray(value) ? value : []);
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
            donation_status: {
                type: DataTypes.ENUM('in_donation', 'donated'),
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            tableName: 'products',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    ) as ProductModelStatic;  // Use the new static interface

    // Static method to set tags for a product
    ProductModel.setProductTags = async (productId: number, tagNames: string[]) => {
        const transaction = await sequelize.transaction();
        try {
            // Remove existing tags
            await sequelize.models.ProductTag.destroy({
                where: { product_id: productId },
                transaction
            });

            // Create or find tags
            const tagPromises = tagNames.map(async (tagName) => {
                const [tag] = await sequelize.models.Tag.findOrCreate({
                    where: { tag_name: tagName },
                    transaction
                });
                return tag as TagModel;  // Type assertion
            });

            const tags = await Promise.all(tagPromises);

            // Create product-tag associations
            const productTagData = tags.map(tag => ({
                product_id: productId,
                tag_id: tag.tag_id
            }));

            await sequelize.models.ProductTag.bulkCreate(productTagData, { transaction });

            await transaction.commit();
            return tags;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    };

    // Static method to get tags for a product
    ProductModel.getProductTags = async (productId: number) => {
        const tags = await sequelize.models.Tag.findAll({
            include: [{
                model: sequelize.models.ProductTag,
                where: { product_id: productId }
            }]
        }) as TagModel[];  // Type assertion

        return tags.map(tag => tag.tag_name);
    };

    return ProductModel;
};

export const initProductModel = (sequelize: Sequelize): ProductModelStatic => {
    return Product(sequelize, DataTypes);
};

export type { 
    ProductAttributes, 
    ProductModel, 
    ProductModelStatic 
};