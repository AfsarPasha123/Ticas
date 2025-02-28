import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import { Request, Response } from 'express';

import { Product } from '../models/index.js';

declare module 'express' {
    export interface Request {
        user?: {
            user_id: number;
            email: string;
            username?: string;
        };
    }
}

export const moveToDonation = async (req: Request, res: Response): Promise<Response> => {
    const { productIds }: { productIds: number[] } = req.body; // Expecting an array of product IDs

    // Validate that productIds is an array and not empty
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_TYPES.ERROR,
            message: 'Product IDs must be provided as a non-empty array.',
        });
    }

    try {
        await Product.update(
            { donation_status: 'in_donation' },
            { where: { product_id: productIds } }
        );

        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: 'Products moved to donation successfully.',
        });
    } catch (error) {
        console.error('Error moving products to donation:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};

export const donateProducts = async (req: Request, res: Response): Promise<Response> => {
    const { productIds }: { productIds: number[] } = req.body; // Expecting an array of product IDs

    // Validate that productIds is an array and not empty
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_TYPES.ERROR,
            message: 'Product IDs must be provided as a non-empty array.',
        });
    }

    try {
        await Product.update(
            { donation_status: 'donated' },
            { where: { product_id: productIds } }
        );

        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: 'Products donated successfully.',
        });
    } catch (error) {
        console.error('Error donating products:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};

// New function to retrieve products that are in the donation process
export const getInDonationProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const owner_id = req.user?.user_id; // Get the authenticated user's ID

        // Fetch products that are in the donation process
        const products = await Product.findAll({
            where: { owner_id, donation_status: 'in_donation' },
            attributes: [
                "product_id",
                "product_name",
                "description",
                "price",
                "primary_image_url",
                "donation_status" // Include donation status in the response
            ],
        });

        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: 'In-donation products retrieved successfully.',
            data: products.map(product => product.toJSON()), // Convert to JSON
        });
    } catch (error) {
        console.error('Error retrieving in-donation products:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};

// New function to retrieve products that have been donated
export const getDonatedProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const owner_id = req.user?.user_id; // Get the authenticated user's ID

        // Fetch products that have been donated
        const products = await Product.findAll({
            where: { owner_id, donation_status: 'donated' },
            attributes: [
                "product_id",
                "product_name",
                "description",
                "price",
                "primary_image_url",
                "donation_status" // Include donation status in the response
            ],
        });

        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: 'Donated products retrieved successfully.',
            data: products.map(product => product.toJSON()), // Convert to JSON
        });
    } catch (error) {
        console.error('Error retrieving donated products:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};


// Existing function to retrieve all products for the authenticated user with donation status
export const getDonationStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const owner_id = req.user?.user_id; // Get the authenticated user's ID

        // Fetch products with their donation status
        const products = await Product.findAll({
            where: { owner_id },
            attributes: [
                "product_id",
                "product_name",
                "description",
                "price",
                "primary_image_url",
                "donation_status" // Include donation status in the response
            ],
        });

        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: 'Products retrieved successfully.',
            data: products.map(product => product.toJSON()), // Convert to JSON
        });
    } catch (error) {
        console.error('Error retrieving donation status:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};