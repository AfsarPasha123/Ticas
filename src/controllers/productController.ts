import { Request, Response } from 'express';
import { Product, Space } from '../models/index.js';
import { uploadToS3 } from '../services/s3Service.js';
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import path from 'path';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

// Create a new product
export const createProduct = async (req: MulterRequest, res: Response): Promise<Response> => {
    try {
        const { product_name, description, price, space_id } = req.body;
        const image = req.file;

        if (!product_name || !price || !space_id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
                status: HTTP_STATUS.BAD_REQUEST
            });
        }

        // Check if space exists
        const space = await Space.findByPk(space_id);
        if (!space) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        let primary_image_url = '';

        if (image) {
            const fileExtension = path.extname(image.originalname);
            const key = `products/${Date.now()}${fileExtension}`;
            primary_image_url = await uploadToS3(image, key);
        }

        const product = await Product.create({
            product_name,
            description: description || '',
            price,
            space_id,
            primary_image_url,
            owner_id: req.user?.user_id || 0 // This should be handled by auth middleware
        });

        return res.status(HTTP_STATUS.CREATED).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.CREATED,
            data: product.toJSON(),
            status: HTTP_STATUS.CREATED
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};

// Get all products
export const getAllProducts = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const products = await Product.findAll({
            attributes: ['product_id', 'product_name', 'description', 'price', 'primary_image_url']
        });

        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
            data: products.map(product => product.toJSON()),
            status: HTTP_STATUS.OK
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const product_id = parseInt(req.params.id);

        if (isNaN(product_id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.INVALID_REQUEST,
                status: HTTP_STATUS.BAD_REQUEST
            });
        }

        const product = await Product.findByPk(product_id);

        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
            data: product.toJSON(),
            status: HTTP_STATUS.OK
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};

// Update product
export const updateProduct = async (req: MulterRequest, res: Response): Promise<Response> => {
    try {
        const product_id = parseInt(req.params.id);
        const { product_name, description, price, space_id } = req.body;
        const image = req.file;

        if (isNaN(product_id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.INVALID_REQUEST,
                status: HTTP_STATUS.BAD_REQUEST
            });
        }

        const product = await Product.findByPk(product_id);

        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        let primary_image_url = product.primary_image_url || '';

        if (image) {
            const fileExtension = path.extname(image.originalname);
            const key = `products/${Date.now()}${fileExtension}`;
            primary_image_url = await uploadToS3(image, key);
        }

        if (space_id) {
            const space = await Space.findByPk(space_id);
            if (!space) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    type: RESPONSE_TYPES.ERROR,
                    message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
                    status: HTTP_STATUS.NOT_FOUND
                });
            }
        }

        await product.update({
            product_name: product_name || product.product_name,
            description: description || product.description,
            price: price || product.price,
            space_id: space_id || product.space_id,
            primary_image_url
        });

        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.UPDATED,
            data: product.toJSON(),
            status: HTTP_STATUS.OK
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const product_id = parseInt(req.params.id);

        if (isNaN(product_id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.INVALID_REQUEST,
                status: HTTP_STATUS.BAD_REQUEST
            });
        }

        const product = await Product.findByPk(product_id);

        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        await product.destroy();

        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.DELETED,
            status: HTTP_STATUS.OK
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};
