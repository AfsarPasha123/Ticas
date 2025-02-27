import { Collection, Product, Space } from "../models/index.js";
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES, } from "../constants/responseConstants.js";
import { getSignedDownloadUrl, uploadToS3 } from "../services/s3Service.js";
import { Op } from "sequelize";
import path from "path";
// Create a new product
export const createProduct = async (inputProductData, req, res) => {
    // Destructure input product data
    const { product_name, description, price, space_id, primary_image_url: initialPrimaryImageUrl, collection_ids, owner_id, donation_status } = inputProductData;
    // Validate donation status
    const validDonationStatuses = ['in_donation', 'donated'];
    const validatedDonationStatus = donation_status && validDonationStatuses.includes(donation_status)
        ? donation_status
        : undefined;
    // If called from route, use route-specific logic
    if (req && res) {
        let key = '';
        let primary_image_url = initialPrimaryImageUrl;
        let image = req.file;
        if (image) {
            const fileExtension = path.extname(image.originalname);
            key = `products/${Date.now()}${fileExtension}`;
            primary_image_url = await uploadToS3(image, key);
        }
        // Prepare product creation data for route-specific scenario
        const routeInputData = {
            product_name: product_name,
            description: description || "",
            price: price,
            space_id: space_id,
            primary_image_url: primary_image_url || key,
            collection_ids: collection_ids || [],
            owner_id: req.user?.user_id || 0,
            ...(validatedDonationStatus ? { donation_status: validatedDonationStatus } : {})
        };
        const product = await Product.create(routeInputData);
        return res.status(HTTP_STATUS.CREATED).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.CREATED,
            data: product
        });
    }
    // If called directly, just create the product
    const directInputData = {
        product_name: product_name,
        description: description || "",
        price: price,
        space_id: space_id,
        primary_image_url: initialPrimaryImageUrl,
        collection_ids: collection_ids || [],
        owner_id: owner_id || 0,
        ...(validatedDonationStatus ? { donation_status: validatedDonationStatus } : {})
    };
    const product = await Product.create(directInputData);
    return product;
};
// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, donation_status, ...otherFilters } = req.query;
        const pageNum = Number(page);
        const pageSizeNum = Number(pageSize);
        const offset = (pageNum - 1) * pageSizeNum;
        // Prepare where conditions
        const whereConditions = {
            ...otherFilters,
            owner_id: req.user?.user_id
        };
        // Only add donation_status to filter if explicitly provided
        if (donation_status) {
            const validDonationStatuses = ['in_donation', 'donated'];
            if (!validDonationStatuses.includes(donation_status)) {
                return res.status(400).json({
                    type: RESPONSE_TYPES.ERROR,
                    message: 'Invalid donation status'
                });
            }
            whereConditions.donation_status = donation_status;
        }
        const { count, rows: products } = await Product.findAndCountAll({
            where: whereConditions,
            limit: pageSizeNum,
            offset: offset,
            order: [['created_at', 'DESC']],
        });
        // Add signed URLs for images and handle donation status
        const productsWithUrls = await Promise.all(products.map(async (product) => {
            const productJson = product.toJSON();
            // Only include donation_status for 'in_donation' and 'donated' products
            if (productJson.donation_status === 'in_donation' || productJson.donation_status === 'donated') {
                // Keep the donation_status as is
            }
            else {
                // Remove donation_status for other products
                delete productJson.donation_status;
            }
            if (productJson.primary_image_url) {
                productJson.primary_image_url = await getSignedDownloadUrl(productJson.primary_image_url);
            }
            return productJson;
        }));
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            data: {
                products: productsWithUrls,
                pagination: {
                    total: count,
                    page: pageNum,
                    pageSize: pageSizeNum,
                    totalPages: Math.ceil(count / pageSizeNum)
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
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
// Get products by donation status
export const getProductsByDonationStatus = async (req, res) => {
    try {
        const { status } = req.params;
        // Validate donation status
        const validStatuses = ['not_donated', 'in_donation', 'donated'];
        if (!validStatuses.includes(status)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: 'Invalid donation status',
                status: HTTP_STATUS.BAD_REQUEST,
            });
        }
        const products = await Product.findAll({
            where: {
                donation_status: status,
                owner_id: req.user?.user_id
            },
            order: [['created_at', 'DESC']]
        });
        // Add signed URLs for images
        const productsWithUrls = await Promise.all(products.map(async (product) => {
            const productJson = product.toJSON();
            if (productJson.primary_image_url) {
                productJson.primary_image_url = await getSignedDownloadUrl(productJson.primary_image_url);
            }
            return productJson;
        }));
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: `${status} products retrieved successfully`,
            data: productsWithUrls,
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error(`Error retrieving ${req.params.status} products:`, error);
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
        let { collection_id } = req.body;
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
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.UPDATED,
            data: {
                ...product.toJSON(),
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
//# sourceMappingURL=productController.js.map