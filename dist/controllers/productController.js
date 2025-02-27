import { Collection, Product, Space, Tag, Category } from "../models/index.js";
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES, } from "../constants/responseConstants.js";
import { getSignedDownloadUrl, uploadToS3 } from "../services/s3Service.js";
import { Op } from "sequelize";
import path from "path";
// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { product_name, description, price, space_id } = req.body;
        const image = req.file;
        let { collection_id, tags } = req.body;
        if (!product_name || !price || !space_id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
                status: HTTP_STATUS.BAD_REQUEST,
            });
        }
        console.log("Product place");
        // Check if space exists
        const space = await Space.findByPk(space_id);
        if (!space) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
            });
        }
        // Convert collection_id to an array of numbers if it exists
        if (collection_id) {
            if (!Array.isArray(collection_id)) {
                collection_id = [collection_id];
            }
            collection_id = collection_id.map((id) => parseInt(id, 10));
        }
        // Check if collection exists
        if (Array.isArray(collection_id)) {
            for (const id of collection_id) {
                const collection = await Collection.findByPk(parseInt(id));
                if (!collection) {
                    return res.status(HTTP_STATUS.NOT_FOUND).json({
                        type: RESPONSE_TYPES.ERROR,
                        message: RESPONSE_MESSAGES.COLLECTION.NOT_FOUND,
                        status: HTTP_STATUS.NOT_FOUND,
                    });
                }
            }
        }
        // Process tags if provided
        let tagIds = [];
        if (tags) {
            // Convert tags to array if it's not already
            if (!Array.isArray(tags)) {
                tags = [tags];
            }
            // Find or create tags
            for (const tagName of tags) {
                const [tag] = await Tag.findOrCreate({
                    where: { name: tagName.trim().toLowerCase() },
                });
                if (tag.id !== undefined) {
                    tagIds.push(tag.id);
                }
            }
        }
        let primary_image_url = "";
        let key = "";
        if (image) {
            const fileExtension = path.extname(image.originalname);
            key = `products/${Date.now()}${fileExtension}`;
            primary_image_url = await uploadToS3(image, key);
        }
        const product = await Product.create({
            product_name,
            description: description || "",
            price,
            space_id,
            primary_image_url: key,
            collection_ids: collection_id ? collection_id : [],
            owner_id: req.user?.user_id || 0, // This should be handled by auth middleware
        });
        // Associate tags with the product
        if (tagIds.length > 0) {
            await product.addTags(tagIds);
        }
        // Fetch the product with its tags
        const productWithTags = await Product.findByPk(product.product_id, {
            include: [{ model: Tag, through: { attributes: [] } }]
        });
        if (!productWithTags) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                type: RESPONSE_TYPES.ERROR,
                message: "Failed to retrieve the created product",
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            });
        }
        return res.status(HTTP_STATUS.CREATED).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.CREATED,
            data: {
                ...productWithTags.toJSON(),
                primary_image_url: primary_image_url,
            },
            status: HTTP_STATUS.CREATED,
        });
    }
    catch (error) {
        console.error("Error creating product:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Get all products
export const getAllProducts = async (_req, res) => {
    try {
        const owner_id = _req.user?.user_id;
        const products = await Product.findAll({
            where: { owner_id },
            attributes: [
                "product_id",
                "product_name",
                "description",
                "price",
                "primary_image_url",
            ],
            include: [{ model: Tag, through: { attributes: [] } }]
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
            data: await Promise.all(products.map(async (product) => {
                return {
                    ...product.toJSON(),
                    tags: product.tags?.map((tag) => tag.name) || [],
                    primary_image_url: await getSignedDownloadUrl(product?.primary_image_url),
                };
            })),
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const product_id = parseInt(req.params.id);
        const owner_id = req?.user?.user_id;
        if (isNaN(product_id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.INVALID_REQUEST,
                status: HTTP_STATUS.BAD_REQUEST,
            });
        }
        const product = await Product.findOne({
            where: { product_id, owner_id },
            include: [{ model: Tag, through: { attributes: [] } }]
        });
        const collection = await Collection.findAll({
            where: { owner_id, collection_id: {
                    [Op.in]: product?.collection_ids
                } },
            attributes: ["collection_name"]
        });
        const space = await Space.findOne({
            where: { owner_id, space_id: product?.space_id },
            attributes: ["space_name"]
        });
        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
            });
        }
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
            data: {
                ...product.toJSON(),
                tags: product.tags?.map((tag) => tag.name) || [],
                collection_names: collection.map((item) => item.getDataValue("collection_name")),
                space_name: space?.getDataValue("space_name"),
                primary_image_url: await getSignedDownloadUrl(product?.primary_image_url),
            },
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error fetching product:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Update product
export const updateProduct = async (req, res) => {
    try {
        const product_id = parseInt(req.params.id);
        const { product_name, description, price, space_id } = req.body;
        const image = req.file;
        let { collection_id, tags } = req.body;
        if (isNaN(product_id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.INVALID_REQUEST,
                status: HTTP_STATUS.BAD_REQUEST,
            });
        }
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
            });
        }
        let primary_image_url = product.primary_image_url || "";
        let key = "";
        if (image) {
            const fileExtension = path.extname(image.originalname);
            key = `products/${Date.now()}${fileExtension}`;
            primary_image_url = await uploadToS3(image, key);
        }
        // Convert collection_id to an array of numbers if it exists
        if (collection_id) {
            if (!Array.isArray(collection_id)) {
                collection_id = [collection_id];
            }
            collection_id = collection_id.map((id) => parseInt(id, 10));
        }
        // Check if collection exists
        if (Array.isArray(collection_id)) {
            for (const id of collection_id) {
                const collection = await Collection.findByPk(parseInt(id));
                if (!collection) {
                    return res.status(HTTP_STATUS.NOT_FOUND).json({
                        type: RESPONSE_TYPES.ERROR,
                        message: RESPONSE_MESSAGES.COLLECTION.NOT_FOUND,
                        status: HTTP_STATUS.NOT_FOUND,
                    });
                }
            }
        }
        if (space_id) {
            const space = await Space.findByPk(space_id);
            if (!space) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    type: RESPONSE_TYPES.ERROR,
                    message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
                    status: HTTP_STATUS.NOT_FOUND,
                });
            }
        }
        await product.update({
            product_name: product_name || product.product_name,
            description: description || product.description,
            price: price || product.price,
            space_id: parseInt(space_id) || product.space_id,
            collection_ids: collection_id || product.collection_ids,
            primary_image_url: key,
        });
        // Handle tags if provided
        if (tags) {
            // Parse tags if they're provided as a string
            if (typeof tags === 'string') {
                try {
                    tags = JSON.parse(tags);
                }
                catch (e) {
                    tags = tags.split(',').map((tag) => tag.trim());
                }
            }
            // Process tags
            if (Array.isArray(tags) && tags.length > 0) {
                // Create tags that don't exist yet and get their IDs
                const tagIds = await Promise.all(tags.map(async (tagName) => {
                    const [tag] = await Tag.findOrCreate({
                        where: { name: tagName.toLowerCase() },
                    });
                    return tag.id;
                }));
                // Filter out any undefined values and ensure we have valid tag IDs
                const validTagIds = tagIds.filter((id) => id !== undefined);
                // Clear existing tags and add new ones
                await product.setTags([]);
                await product.addTags(validTagIds);
            }
        }
        // Fetch the updated product with its tags
        const updatedProduct = await Product.findByPk(product_id, {
            include: [{ model: Tag, through: { attributes: [] } }]
        });
        if (!updatedProduct) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
            });
        }
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.UPDATED,
            data: {
                ...updatedProduct.toJSON(),
                tags: updatedProduct.tags?.map((tag) => tag.name) || [],
                primary_image_url: primary_image_url,
            },
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error updating product:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product_id = parseInt(req.params.id);
        if (isNaN(product_id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.INVALID_REQUEST,
                status: HTTP_STATUS.BAD_REQUEST,
            });
        }
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND,
            });
        }
        await product.destroy();
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.DELETED,
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Search products by tags
export const searchProductsByTags = async (req, res) => {
    try {
        const { tags, category } = req.query;
        const owner_id = req.user?.user_id;
        if (!tags && !category) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: "Either tags or category parameter is required",
                status: HTTP_STATUS.BAD_REQUEST,
            });
        }
        let tagIds = [];
        // If tags are provided, find tag IDs for the provided tag names
        if (tags) {
            // Parse tags from query parameter
            let tagArray = [];
            if (typeof tags === 'string') {
                tagArray = tags.split(',').map((tag) => tag.trim().toLowerCase());
            }
            const tagRecords = await Tag.findAll({
                where: {
                    name: {
                        [Op.in]: tagArray
                    }
                }
            });
            // Filter out any undefined tag IDs
            tagIds = tagRecords.map(tag => tag.id).filter((id) => id !== undefined);
        }
        // If category is provided, find all tags associated with the category
        if (category && typeof category === 'string') {
            const categoryRecord = await Category.findOne({
                where: {
                    category_name: category.trim()
                },
                include: [
                    {
                        model: Tag,
                        through: { attributes: [] }
                    }
                ]
            });
            if (categoryRecord && categoryRecord.tags) {
                // Add category tag IDs to the existing tag IDs (if any)
                const categoryTagIds = categoryRecord.tags.map(tag => tag.id).filter((id) => id !== undefined);
                tagIds = [...new Set([...tagIds, ...categoryTagIds])];
            }
        }
        // If no matching tags found, return empty array
        if (tagIds.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                type: RESPONSE_TYPES.SUCCESS,
                message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
                data: [],
                status: HTTP_STATUS.OK,
            });
        }
        // Find products with the specified tags
        const products = await Product.findAll({
            where: { owner_id },
            include: [
                {
                    model: Tag,
                    through: { attributes: [] },
                    where: {
                        id: {
                            [Op.in]: tagIds
                        }
                    }
                }
            ],
            attributes: [
                "product_id",
                "product_name",
                "description",
                "price",
                "primary_image_url",
            ],
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
            data: await Promise.all(products.map(async (product) => {
                return {
                    ...product.toJSON(),
                    tags: product.tags?.map((tag) => tag.name) || [],
                    primary_image_url: await getSignedDownloadUrl(product?.primary_image_url),
                };
            })),
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error searching products by tags:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Search products by category
export const searchProductsByCategory = async (req, res) => {
    try {
        const { category_id } = req.params;
        const owner_id = req.user?.user_id;
        if (!category_id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: "Category ID is required",
                status: HTTP_STATUS.BAD_REQUEST,
            });
        }
        // Find the category and its tags
        const categoryRecord = await Category.findByPk(parseInt(category_id), {
            include: [
                {
                    model: Tag,
                    through: { attributes: [] }
                }
            ]
        });
        if (!categoryRecord) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: "Category not found",
                status: HTTP_STATUS.NOT_FOUND,
            });
        }
        // Get tag IDs from the category
        const tagIds = (categoryRecord.tags?.map(tag => tag.id) || []).filter((id) => id !== undefined);
        // If no tags in the category, return empty array
        if (tagIds.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                type: RESPONSE_TYPES.SUCCESS,
                message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
                data: [],
                status: HTTP_STATUS.OK,
            });
        }
        // Find products with any of the category's tags
        const products = await Product.findAll({
            where: { owner_id },
            include: [
                {
                    model: Tag,
                    through: { attributes: [] },
                    where: {
                        id: {
                            [Op.in]: tagIds
                        }
                    }
                }
            ],
            attributes: [
                "product_id",
                "product_name",
                "description",
                "price",
                "primary_image_url",
            ],
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
            data: await Promise.all(products.map(async (product) => {
                return {
                    ...product.toJSON(),
                    tags: product.tags?.map((tag) => tag.name) || [],
                    primary_image_url: await getSignedDownloadUrl(product?.primary_image_url),
                };
            })),
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error searching products by category:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
//# sourceMappingURL=productController.js.map