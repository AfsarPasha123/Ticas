import { Response } from "express";
import { Space } from "../models/Space.js";
import { User } from "../models/User.js";
import { Product } from "../models/index.js";
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  RESPONSE_TYPES,
} from "../constants/responseConstants.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
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

interface SpaceRequest extends AuthenticatedRequest {
  body: {
    space_name: string;
    description: string;
  };
  file?: Express.Multer.File;
}

// Function to handle creating a new space
export const createSpace = async (
  req: SpaceRequest,
  res: Response
): Promise<Response> => {
  let uploadedImageUrl: string | null = null;
  let spaceCreated = false;

  try {
    console.log("Create Space Request Received");
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    const space_name = req.body.space_name;
    const description = req.body.description;

    if (!space_name || !description) {
      console.log(
        "Missing Fields - space_name:",
        space_name,
        "description:",
        description
      );
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
        details: { space_name, description },
      });
    }

    // Check if user exists
    const userId = req.user!.user_id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_TYPES.ERROR,
        message: "User not found. Please login again.",
      });
    }

    // Upload image to S3 if provided
    if (req.file) {
      try {
        const key = `spaces/${userId}/${Date.now()}-${path.basename(
          req.file.originalname
        )}`;
        uploadedImageUrl = await uploadToS3(req.file, key);
      } catch (uploadError) {
        console.error("Failed to upload image:", uploadError);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: RESPONSE_TYPES.ERROR,
          message: "Failed to upload image",
          error:
            uploadError instanceof Error
              ? uploadError.message
              : "Unknown error",
        });
      }
    }

    const spaceData = {
      space_name,
      description,
      owner_id: userId,
      space_image: uploadedImageUrl,
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
      data: createdSpace.toJSON(),
    });
  } catch (error) {
    // If we uploaded an image but space creation failed, delete the image
    if (uploadedImageUrl && !spaceCreated) {
      try {
        const key = uploadedImageUrl.split("/").slice(-2).join("/");
        await deleteFromS3(key);
      } catch (deleteError) {
        console.error(
          "Error deleting image after failed space creation:",
          deleteError
        );
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

export const getSpaceById = async (
  req: SpaceRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.SPACE.INVALID_ID,
      });
    }

    const space = await Space.findByPk(id);
    if (!space) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      status: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.SPACE.FETCH_SUCCESS,
      data: space,
    });
  } catch (error) {
    console.error("Error fetching space:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getUserSpaces = async (req: any, res: Response): Promise<Response> => {
  try {
    const spaces = await Space.findAll({
      where: { owner_id: req.user!.user_id }, // Use the authenticated user's ID
    });

    return res.status(HTTP_STATUS.OK).json({
      status: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.SPACE.FETCH_SUCCESS,
      data: spaces,
    });
  } catch (error) {
    console.error("Error fetching user spaces:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get all products in a space
export const getSpaceProducts = async (req: any, res: Response): Promise<Response> => {
  try {
    const space_id  = parseInt(req.params.id);
    const userId = req.user!.user_id;
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
      where: { space_id: space_id, owner_id: userId},
    });
    return res.status(HTTP_STATUS.OK).json({
      status: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching space products:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
    });
  }
};