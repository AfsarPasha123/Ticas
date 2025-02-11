import { Collection } from '../models/Collection.js';
import { Product } from '../models/index.js';
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import { sequelize } from '../database/connection.js';
// Create a new collection
export const createCollection = async (req, res) => {
    try {
        const { collection_name, description } = req.body;
        const owner_id = req.user?.user_id;
        if (!owner_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
            });
        }
        if (!collection_name) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
                status: HTTP_STATUS.BAD_REQUEST
            });
        }
        const collectionData = {
            collection_name,
            owner_id
        };
        if (description) {
            collectionData.description = description;
        }
        const collection = await Collection.create(collectionData);
        return res.status(HTTP_STATUS.CREATED).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.COLLECTION.CREATED,
            data: collection.toJSON(),
            status: HTTP_STATUS.CREATED
        });
    }
    catch (error) {
        console.error('Error creating collection:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};
// Get collection details
export const getCollectionDetails = async (req, res) => {
    try {
        const collection_id = parseInt(req.params.id);
        const owner_id = req.user?.user_id;
        if (!owner_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
            });
        }
        if (isNaN(collection_id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.COLLECTION.INVALID_DATA,
                status: HTTP_STATUS.BAD_REQUEST
            });
        }
        const collection = await Collection.findOne({
            where: { collection_id, owner_id }
        });
        if (!collection) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.COLLECTION.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.COLLECTION.FETCH_SUCCESS,
            data: collection.toJSON(),
            status: HTTP_STATUS.OK
        });
    }
    catch (error) {
        console.error('Error getting collection details:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};
// Get all products in a collection
export const getCollectionProducts = async (req, res) => {
    try {
        const collection_id = parseInt(req.params.id);
        const owner_id = req.user?.user_id;
        if (!owner_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
            });
        }
        if (isNaN(collection_id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.COLLECTION.INVALID_DATA,
                status: HTTP_STATUS.BAD_REQUEST
            });
        }
        const collection = await Collection.findOne({
            where: { collection_id, owner_id }
        });
        if (!collection) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.COLLECTION.NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }
        const products = await Product.findAll({
            where: sequelize.literal(`JSON_CONTAINS(collection_ids, '${collection_id}')`)
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.COLLECTION.FETCH_SUCCESS,
            data: products.map(product => product.toJSON()),
            status: HTTP_STATUS.OK
        });
    }
    catch (error) {
        console.error('Error getting collection products:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};
// Get collections for a user
export const getUserCollections = async (req, res) => {
    try {
        const owner_id = req.user?.user_id;
        if (!owner_id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
            });
        }
        const collections = await Collection.findAll({
            where: { owner_id }
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.COLLECTION.FETCH_SUCCESS,
            data: collections.map(collection => collection.toJSON()),
            status: HTTP_STATUS.OK
        });
    }
    catch (error) {
        console.error('Error getting user collections:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};
//# sourceMappingURL=collectionController.js.map