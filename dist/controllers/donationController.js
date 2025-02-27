import { Product } from '../models/index.js';
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import { Op } from 'sequelize';
// Move product(s) to donation status
export const moveProductToDonation = async (req, res) => {
    try {
        const { productIds } = req.body;
        // Validate input
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: 'Invalid product IDs',
                status: HTTP_STATUS.BAD_REQUEST
            });
        }
        // Update products to 'in_donation' status
        const [updatedCount] = await Product.update({ donation_status: 'in_donation' }, {
            where: {
                product_id: {
                    [Op.in]: productIds
                }
            }
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: `${updatedCount} product(s) moved to donation`,
            data: { updatedCount },
            status: HTTP_STATUS.OK
        });
    }
    catch (error) {
        console.error('Error moving products to donation:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};
// Mark product(s) as donated
export const markProductAsDonated = async (req, res) => {
    try {
        const { productIds } = req.body;
        // Validate input
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: 'Invalid product IDs',
                status: HTTP_STATUS.BAD_REQUEST
            });
        }
        // Update products to 'donated' status
        const [updatedCount] = await Product.update({ donation_status: 'donated' }, {
            where: {
                product_id: {
                    [Op.in]: productIds
                },
                // Remove the 'in_donation' condition to allow marking any product as donated
            }
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: `${updatedCount} product(s) marked as donated`,
            data: { updatedCount },
            status: HTTP_STATUS.OK
        });
    }
    catch (error) {
        console.error('Error marking products as donated:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};
// Get products in donation
export const getDonationProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: {
                donation_status: 'in_donation',
                owner_id: req.user?.user_id
            }
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: 'Products in donation retrieved successfully',
            data: products,
            status: HTTP_STATUS.OK
        });
    }
    catch (error) {
        console.error('Error retrieving donation products:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};
// Get donated products
export const getDonatedProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: {
                donation_status: 'donated',
                owner_id: req.user?.user_id
            }
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: 'Donated products retrieved successfully',
            data: products,
            status: HTTP_STATUS.OK
        });
    }
    catch (error) {
        console.error('Error retrieving donated products:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};
//# sourceMappingURL=donationController.js.map