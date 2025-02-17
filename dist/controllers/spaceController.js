import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES, } from "../constants/responseConstants.js";
import { deleteFromS3, getSignedDownloadUrl, uploadToS3 } from "../services/s3Service.js";
import { Product } from "../models/index.js";
import { Space } from "../models/index.js";
import { User } from "../models/User.js";
import multer from "multer";
import path from "path";
// Configure multer for memory storage
const storage = multer.memoryStorage();
// File filter for images
const fileFilter = (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, JPG, PNG and GIF images are allowed."));
    }
};
// Export the upload middleware
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Function to handle creating a new space
export const createSpace = async (req, res) => {
    let uploadedImageUrl = null;
    let spaceCreated = false;
    try {
        const space_name = req.body.space_name;
        const description = req.body.description;
        const space_image = req.file;
        if (!space_name || !description) {
            console.log("Missing Fields - space_name:", space_name, "description:", description);
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
                details: { space_name, description },
            });
        }
        // Check if user exists
        const userId = req.user.user_id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_TYPES.ERROR,
                message: "User not found. Please login again.",
            });
        }
        // Upload image to S3 if provided
        let key = "";
        if (space_image) {
            const fileExtension = path.extname(space_image.originalname);
            key = `spaces/${userId}/${Date.now()}${fileExtension}`;
            uploadedImageUrl = await uploadToS3(space_image, key);
        }
        const spaceData = {
            space_name,
            description,
            owner_id: userId,
            space_image: key,
        };
        const newSpace = await Space.create(spaceData);
        spaceCreated = true;
        const createdSpace = await Space.findByPk(newSpace.space_id);
        if (!createdSpace) {
            throw new Error("Space was created but could not be retrieved");
        }
        return res.status(HTTP_STATUS.CREATED).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.SPACE.CREATED_SUCCESSFULLY,
            data: {
                ...createdSpace.toJSON(),
                space_image: uploadedImageUrl
            },
        });
    }
    catch (error) {
        // If we uploaded an image but space creation failed, delete the image
        if (uploadedImageUrl && !spaceCreated) {
            try {
                const key = uploadedImageUrl.split("/").slice(-2).join("/");
                await deleteFromS3(key);
            }
            catch (deleteError) {
                console.error("Error deleting image after failed space creation:", deleteError);
            }
        }
        console.error("Error creating space:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
export const getSpaceById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;
        if (!id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.SPACE.INVALID_ID,
            });
        }
        const space = await Space.findOne({
            where: { space_id: id, owner_id: userId },
        });
        if (!space) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
            });
        }
        const getProducts = await Product.findAll({
            where: { space_id: id, owner_id: userId },
        });
        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.SPACE.FETCH_SUCCESS,
            data: {
                ...space.toJSON(),
                space_image: await getSignedDownloadUrl(space.getDataValue('space_image')),
                products: {
                    total_products: getProducts.length,
                    total_products_worth: +getProducts.reduce((acc, product) => parseFloat(acc) + parseFloat(product.price), 0).toFixed(2),
                    total_categories: 0, // TODO : Add total categories later
                },
            },
        });
    }
    catch (error) {
        console.error("Error fetching space:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};
export const getUserSpaces = async (req, res) => {
    try {
        const spaces = await Space.findAll({
            where: { owner_id: req.user.user_id }, // Use the authenticated user's ID
        });
        const signedUrls = await Promise.all(spaces.map(async (item) => {
            const spaceImage = item.getDataValue('space_image');
            if (spaceImage) {
                const signedUrl = await getSignedDownloadUrl(spaceImage);
                console.log(`Signed URL for ${spaceImage}: ${signedUrl}`);
                return signedUrl;
            }
            else {
                console.log(`No space_image for item with ID ${item.getDataValue('space_id')}`);
                return null;
            }
        }));
        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.SPACE.FETCH_SUCCESS,
            data: await Promise.all(spaces.map(async (item, index) => {
                return {
                    ...item.toJSON(),
                    space_image: signedUrls[index] || item.getDataValue('space_image'), // Use the signed URL if available, otherwise use the original value
                };
            }))
        });
    }
    catch (error) {
        console.error("Error fetching user spaces:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};
// Get all products in a space
export const getSpaceProducts = async (req, res) => {
    try {
        const space_id = parseInt(req.params.id);
        const userId = req.user.user_id;
        if (!space_id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.SPACE.INVALID_ID,
            });
        }
        const space = await Space.findOne({
            where: { space_id: space_id, owner_id: userId },
        });
        if (!space) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
            });
        }
        const products = await Product.findAll({
            where: { space_id: space_id, owner_id: userId },
        });
        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
            data: await Promise.all(products.map(async (product) => {
                return {
                    ...product.toJSON(),
                    primary_image_url: await getSignedDownloadUrl(product?.primary_image_url),
                };
            }))
        });
    }
    catch (error) {
        console.error("Error fetching space products:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};
//# sourceMappingURL=spaceController.js.map