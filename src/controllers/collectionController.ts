import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import {
  Collection,
  CollectionCreationAttributes,
} from "../models/Collection.js";
import { Product } from "../models/index.js";
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  RESPONSE_TYPES,
} from "../constants/responseConstants.js";
import { sequelize } from "../database/connection.js";
import multer from "multer";
import path from "path";
import { uploadToS3, deleteFromS3 } from "../services/s3Service.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG and GIF images are allowed.")
    );
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

interface CollectionRequest extends AuthenticatedRequest {
  body: {
    collection_name: string;
    description: string;
  };
  file?: Express.Multer.File;
}

// Create a new collection
export const createCollection = async (
  req: CollectionRequest,
  res: Response
): Promise<Response> => {
  let uploadedImageUrl: string | null = null;
  let collectionCreated = false;

  try {
    console.log("Create Collection Request Received");
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    const { collection_name, description } = req.body;
    const owner_id = req.user?.user_id;

    if (!owner_id) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    if (!collection_name || !description) {
      console.log(
        "Missing Fields - collection_name:",
        collection_name,
        "description:",
        description
      );
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    // Upload image to S3 if provided
    if (req.file) {
      try {
        const key = `collections/${owner_id}/${Date.now()}-${path.basename(
          req.file.originalname
        )}`;
        uploadedImageUrl = await uploadToS3(req.file, key);
      } catch (uploadError) {
        console.error("Failed to upload image:", uploadError);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          type: RESPONSE_TYPES.ERROR,
          message: "Failed to upload image",
          error:
            uploadError instanceof Error
              ? uploadError.message
              : "Unknown error",
        });
      }
    }

    const collectionData: CollectionCreationAttributes = {
      collection_name,
      description,
      owner_id,
      collection_image: uploadedImageUrl,
    };

    const collection = await Collection.create(collectionData);
    collectionCreated = true;

    return res.status(HTTP_STATUS.CREATED).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.COLLECTION.CREATED,
      data: collection.toJSON(),
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    // If collection was not created but image was uploaded, delete the image
    if (!collectionCreated && uploadedImageUrl) {
      try {
        const key = uploadedImageUrl.split("/").slice(-1)[0];
        await deleteFromS3(key);
      } catch (deleteError) {
        console.error(
          "Failed to delete uploaded image after collection creation failed:",
          deleteError
        );
      }
    }

    console.error("Error creating collection:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get collection details
export const getCollectionDetails = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const collection_id = parseInt(req.params.id);
    const owner_id = req.user?.user_id;

    if (!owner_id) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    if (isNaN(collection_id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.COLLECTION.INVALID_DATA,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const collection = await Collection.findOne({
      where: { collection_id, owner_id },
    });

    if (!collection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.COLLECTION.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.COLLECTION.FETCH_SUCCESS,
      data: collection.toJSON(),
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    console.error("Error getting collection details:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get all products in a collection
export const getCollectionProducts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const collection_id = parseInt(req.params.id);
    const owner_id = req.user?.user_id;

    if (!owner_id) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    if (isNaN(collection_id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.COLLECTION.INVALID_DATA,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const collection = await Collection.findOne({
      where: { collection_id, owner_id },
    });

    if (!collection) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.COLLECTION.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    const products = await Product.findAll({
      where: sequelize.literal(
        `JSON_CONTAINS(collection_ids, '${collection_id}')`
      ),
    });

    return res.status(HTTP_STATUS.OK).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.COLLECTION.FETCH_SUCCESS,
      data: products.map((product) => product.toJSON()),
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    console.error("Error getting collection products:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get collections for a user
export const getUserCollections = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const owner_id = req.user?.user_id;

    if (!owner_id) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.AUTH.TOKEN_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const collections = await Collection.findAll({
      where: { owner_id },
    });

    return res.status(HTTP_STATUS.OK).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.COLLECTION.FETCH_SUCCESS,
      data: collections.map((collection) => collection.toJSON()),
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    console.error("Error getting user collections:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};
