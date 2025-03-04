import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  RESPONSE_TYPES,
} from "../constants/responseConstants.js";
import { deleteFromS3, getSignedDownloadUrl, uploadToS3 } from "../services/s3Service.js";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { Product } from "../models/index.js";
import { Response } from "express";
import { Space } from "../models/index.js"
import { User } from "../models/User.js";
import multer from "multer";
import path from "path";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, JPG, PNG and GIF images are allowed.")
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

export const createSpace = async (
  req: SpaceRequest,
  res: Response
): Promise<Response> => {
  let uploadedImageUrl: string | null = null;
  let spaceCreated = false;

  try {
    const space_name = req.body.space_name;
    const description = req.body.description;
    const space_image = req.file;

    if (!space_name) {
      console.log("Missing Fields - space_name:", space_name);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
        details: { space_name: "Space name is required" },
      });
    }

    const userId = req.user!.user_id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_TYPES.ERROR,
        message: "User not found. Please login again.",
      });
    }

    let key: string | null = null;
    if (space_image) {
      const fileExtension = path.extname(space_image.originalname);
      key = `spaces/${userId}/${Date.now()}${fileExtension}`;
      uploadedImageUrl = await uploadToS3(space_image, key);
    }

    const spaceData = {
      space_name,
      description,
      owner_id: userId,
      space_image: key || null,
    };

    const newSpace = await Space.create(spaceData);
    spaceCreated = true;

    if (!newSpace.space_id) {
      throw new Error("Space was created but no ID was generated");
    }

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
  } catch (error) {
    if (uploadedImageUrl && !spaceCreated) {
      try {
        const key = uploadedImageUrl.split("/").slice(-2).join("/");
        await deleteFromS3(key);
      } catch (deleteError) {
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

export const getSpaceById = async (
  req: SpaceRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user!.user_id;

    const space = await Space.findOne({
      where: { space_id: id, owner_id: userId },
    });
    if (!space) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
      });
    }

    const products = await Product.findAll({
      where: { space_id: id, owner_id: userId },
      attributes: ["product_id", "product_name", "description", "price", "primary_image_url", "donation_status"],
      order: [['created_at', 'DESC']]
    });

    let spaceImage = space.getDataValue('space_image');
    if (!spaceImage && products.length > 0) {
      spaceImage = products[0].primary_image_url;
    }

    const customizedProducts = await Promise.all(products.map(async (product) => {
      const productJSON = product.toJSON();
      if (!productJSON.donation_status) delete productJSON.donation_status;
      return {
        ...productJSON,
        primary_image_url: product?.primary_image_url ? await getSignedDownloadUrl(product?.primary_image_url!) : null,
      };
    }));

    return res.status(HTTP_STATUS.OK).json({
      status: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.SPACE.FETCH_SUCCESS,
      data: {
        ...space.toJSON(),
        space_image: spaceImage ? await getSignedDownloadUrl(spaceImage) : null,
        products: {
          total_products: customizedProducts.length,
          total_products_worth: +customizedProducts.reduce((acc: any, product: any) => 
            parseFloat(acc) + parseFloat(product.price), 0).toFixed(2),
          total_categories: 0,
        },
      },
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
    const owner_id = req?.user?.user_id;
    const spaces = await Space.findAll({
      where: { owner_id },
    });

    if (!spaces.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
      });
    }

    const spaceData = await Promise.all(
      spaces.map(async (space) => {
        const products = await Product.findAll({
          where: { space_id: space.getDataValue("space_id"), owner_id },
          order: [['created_at', 'DESC']]
        });

        let spaceImage = space.getDataValue('space_image');
        if (!spaceImage && products.length > 0) {
          spaceImage = products[0].primary_image_url;
        }

        return {
          ...space.toJSON(),
          space_image: spaceImage ? await getSignedDownloadUrl(spaceImage) : null,
          products: {
            total_products: products.length,
            total_products_worth: +products.reduce((acc: any, product: any) => 
              parseFloat(acc) + parseFloat(product.price), 0).toFixed(2),
          },
        };
      })
    );

    return res.status(HTTP_STATUS.OK).json({
      status: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.SPACE.FETCH_SUCCESS,
      data: spaceData,
    });
  } catch (error) {
    console.error("Error fetching user spaces:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getSpaceProducts = async (req: any, res: Response): Promise<Response> => {
  try {
    const space_id = parseInt(req.params.id);
    const userId = req.user!.user_id;
    
    if (!space_id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.SPACE.INVALID_ID,
      });
    }

    const space = await Space.findOne({
      where: { space_id, owner_id: userId },
    });
    if (!space) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
      });
    }
    
    const products = await Product.findAll({
      where: { space_id, owner_id: userId },
      attributes: ["product_id", "product_name", "description", "price", "primary_image_url", "donation_status"],
      order: [['created_at', 'DESC']]
    });

    const customizedProducts = await Promise.all(products.map(async (product) => {
      const productJSON = product.toJSON();
      if (!productJSON.donation_status) delete productJSON.donation_status;
      return {
        ...productJSON,
        primary_image_url: product?.primary_image_url ? await getSignedDownloadUrl(product?.primary_image_url!) : null,
      };
    }));

    return res.status(HTTP_STATUS.OK).json({
      status: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
      data: customizedProducts,
    });
  } catch (error) {
    console.error("Error fetching space products:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
    });
  }
};

// Add updateSpace function after getSpaceProducts
export const updateSpace = async (
  req: SpaceRequest,
  res: Response
): Promise<Response> => {
  let uploadedImageUrl: string | null = null;

  try {
    const space_id = parseInt(req.params.id);
    const userId = req.user!.user_id;
    const { space_name, description } = req.body;
    const space_image = req.file;

    const space = await Space.findOne({
      where: { space_id, owner_id: userId },
    });

    if (!space) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
      });
    }

    let key = space.getDataValue('space_image');
    if (space_image) {
      // Delete old image if exists
      if (key && key.startsWith('spaces/')) {
        try {
          await deleteFromS3(key);
        } catch (error) {
          console.error("Error deleting old space image:", error);
        }
      }
      
      // Upload new image
      const fileExtension = path.extname(space_image.originalname);
      key = `spaces/${userId}/${Date.now()}${fileExtension}`;
      uploadedImageUrl = await uploadToS3(space_image, key);
    }

    const updateData: any = {};
    if (space_name) updateData.space_name = space_name;
    if (description !== undefined) updateData.description = description;
    if (key) updateData.space_image = key;

    await space.update(updateData);

    // Get latest space data with products
    const products = await Product.findAll({
      where: { space_id, owner_id: userId },
      order: [['created_at', 'DESC']]
    });

    let spaceImage = space.getDataValue('space_image');
    if (!spaceImage && products.length > 0) {
      spaceImage = products[0].primary_image_url;
    }

    const updatedSpace = await Space.findByPk(space_id);
    if (!updatedSpace) {
      throw new Error("Updated space could not be retrieved");
    }

    return res.status(HTTP_STATUS.OK).json({
      status: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.UPDATED,
      data: {
        ...updatedSpace.toJSON(),
        space_image: spaceImage ? await getSignedDownloadUrl(spaceImage) : null,
      },
    });
  } catch (error) {
    console.error("Error updating space:", error);
    
    // Clean up uploaded image if operation failed
    if (uploadedImageUrl) {
      try {
        const key = uploadedImageUrl.split("/").slice(-2).join("/");
        await deleteFromS3(key);
      } catch (deleteError) {
        console.error("Error deleting uploaded image after update failure:", deleteError);
      }
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteSpace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const space_id = parseInt(req.params.id);
    const userId = req.user!.user_id;

    if (!space_id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.SPACE.INVALID_ID,
      });
    }

    const space = await Space.findOne({
      where: { space_id, owner_id: userId },
    });

    if (!space) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
      });
    }

    // Delete space image from S3 if exists
    const spaceImage = space.getDataValue('space_image');
    if (spaceImage && spaceImage.startsWith('spaces/')) {
      try {
        await deleteFromS3(spaceImage);
      } catch (error) {
        console.error("Error deleting space image from S3:", error);
      }
    }

    // Delete all products associated with this space
    await Product.destroy({
      where: { space_id, owner_id: userId }
    });

    // Delete the space
    await space.destroy();

    return res.status(HTTP_STATUS.OK).json({
      status: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.SPACE.DELETED,
    });
  } catch (error) {
    console.error("Error deleting space:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};