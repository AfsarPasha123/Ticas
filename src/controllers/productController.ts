import { Collection, Product, Space, Tag, sequelize, ProductTag } from "../models/index.js";
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  RESPONSE_TYPES,
} from "../constants/responseConstants.js";
import { Request, Response } from "express";
import { getSignedDownloadUrl, uploadToS3 } from "../services/s3Service.js";
import { Op } from 'sequelize';
import path from "path";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Create a new product
export const createProduct = async (
  req: MulterRequest,
  res: Response
): Promise<Response> => {
  const transaction = await sequelize.transaction();
  try {
    const { product_name, description, price, space_id, tag_ids } = req.body;
    const image = req.file;
    let { collection_id } = req.body;
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    if (!product_name || !image) {
      console.log("Missing fields:", { product_name, image });
      await transaction.rollback();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    // Check if space exists
    if (space_id) {
      const space = await Space.findByPk(space_id, { transaction });
      if (!space) {
        await transaction.rollback();
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          type: RESPONSE_TYPES.ERROR,
          message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND,
        });
      }
    }
    
    // Convert collection_id to an array of numbers if it exists
    if (collection_id) {
      if (!Array.isArray(collection_id)) {
        collection_id = [collection_id];
      }
      collection_id = collection_id.map((id: any) => parseInt(id, 10));
    }

    // Check if collection exists
    if (Array.isArray(collection_id)) {
      for (const id of collection_id) {
        const collection = await Collection.findByPk(parseInt(id), { transaction });
        if (!collection) {
          await transaction.rollback();
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.COLLECTION.NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND,
          });
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

    // Prepare tag_ids for storage
    const processedTagIds = tag_ids 
      ? (Array.isArray(tag_ids) 
          ? tag_ids.map(Number) 
          : [Number(tag_ids)])
      : [];

    const product = await Product.create({
      product_name,
      description: description || "",
      price,
      space_id,
      primary_image_url: key,
      collection_ids: collection_id || [],
      owner_id: req.user?.user_id || 0,
      tag_ids: processedTagIds,
    }, { transaction });

    // If tag_ids are provided, associate tags with the product
    if (processedTagIds.length > 0) {
      await Promise.all(processedTagIds.map(async (tagId) => {
        await ProductTag.create({
          product_id: product.product_id!,
          tag_id: tagId
        }, { transaction });
      }));
    }

    // Fetch the created product with tag associations
    const createdProduct = await Product.findByPk(product.product_id, {
      include: [{
        model: Tag,
        attributes: ['tag_id', 'tag_name'],
        through: { attributes: [] },
        as: 'Tags'
      }],
      transaction
    });

    await transaction.commit();

    const productJSON = createdProduct!.toJSON();
    return res.status(HTTP_STATUS.CREATED).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.CREATED,
      data: {
        ...productJSON,
        primary_image_url: primary_image_url,
        tags: productJSON.Tags ? productJSON.Tags.map((tag: any) => ({
          tag_id: tag.tag_id,
          tag_name: tag.tag_name
        })) : []
      },
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating product:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get all products
export const getAllProducts = async (
  _req: Request,
  res: Response
): Promise<Response> => {
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
        "donation_status",
        "space_id",
        "tag_ids"
      ],
      include: [{
        model: Tag,
        attributes: ['tag_name'],
        through: { attributes: [] },
        as: 'Tags'
      }]
    });

    // Calculate the total worth of all products
    const totalWorth = products.reduce((acc, product) => acc + parseFloat(product.price?.toString() || '0'), 0);

    // Calculate the total product count
    const totalCount = products.length;

    const total_spaces = await Space.count({
      where: { owner_id },
    })

    const total_collections = await Collection.count({
      where: {owner_id},
    });

    // Customize the JSON response
    const customizedProducts = await Promise.all(products.map(async (product) => {
      let product_space = null;
      if (product.space_id) {
        product_space = await Space.findOne({
          where: { owner_id, space_id: product.space_id },
          attributes: ["space_name"],
        })
      }
      
      const productJSON = product.toJSON();
      return {
        ...productJSON,
        primary_image_url: product?.primary_image_url ? await getSignedDownloadUrl(product?.primary_image_url!) : null,
        product_space: product_space ? product_space?.getDataValue("space_name") : null,
        tags: productJSON.Tags ? productJSON.Tags.map((tag: any) => tag.tag_name) : [],
      };
    }));

    return res.status(HTTP_STATUS.OK).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
      data: {
        products: customizedProducts,
        totalWorth: totalWorth.toFixed(2),
        totalCount: totalCount,
        total_spaces,
        total_collections,
      },
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

// Get product by ID
export const getProductById = async (
  req: Request,
  res: Response
): Promise<Response> => {
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
      include: [{
        model: Tag,
        attributes: ['tag_id', 'tag_name'],
        through: { attributes: [] },
        as: 'Tags'
      }]
    });

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND,
      });
    }

    const collection = await Collection.findAll({
      where: { owner_id, collection_id: { [Op.in]: product?.collection_ids } },
      attributes: ["collection_name"],
    });

    const space = await Space.findOne({
      where: { owner_id, space_id: product?.space_id },
      attributes: ["space_name"],
    });

    const productJSON = product.toJSON();
    return res.status(HTTP_STATUS.OK).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
      data: {
        ...productJSON,
        collection_names: collection.map((item) => item.getDataValue("collection_name")),
        space_name: space?.getDataValue("space_name"),
        primary_image_url: product?.primary_image_url ? await getSignedDownloadUrl(product?.primary_image_url!):null,
        tags: productJSON.Tags ? productJSON.Tags.map((tag: any) => ({
          tag_id: tag.tag_id,
          tag_name: tag.tag_name
        })) : [],
      },
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

// Update product
export const updateProduct = async (
  req: MulterRequest,
  res: Response
): Promise<Response> => {
  const transaction = await sequelize.transaction();
  try {
    const product_id = parseInt(req.params.id);
    const { product_name, description, price, space_id, tag_ids } = req.body;
    const image = req.file;
    let { collection_id } = req.body;

    if (isNaN(product_id)) {
      await transaction.rollback();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.INVALID_REQUEST,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const product = await Product.findByPk(product_id, {
      include: [{
        model: Tag,
        attributes: ['tag_id', 'tag_name'],
        through: { attributes: [] },
        as: 'Tags'  // Added alias
      }],
      transaction
    });
    if (!product) {
      await transaction.rollback();
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
      collection_id = collection_id.map((id: any) => parseInt(id, 10));
    }

    // Check if collection exists
    if (Array.isArray(collection_id)) {
      for (const id of collection_id) {
        const collection = await Collection.findByPk(parseInt(id), { transaction });
        if (!collection) {
          await transaction.rollback();
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.COLLECTION.NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND,
          });
        }
      }
    }

    // Check if the new space exists
    if (space_id !== null && space_id !== "null" && space_id !== undefined) {
      const space = await Space.findByPk(space_id, { transaction });
      if (!space) {
        await transaction.rollback();
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          type: RESPONSE_TYPES.ERROR,
          message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND,
        });
      }
    }

    // Prepare tag_ids for storage
    const processedTagIds = tag_ids 
      ? (Array.isArray(tag_ids) 
          ? tag_ids.map(Number) 
          : [Number(tag_ids)])
      : [];

    // Handle tag updates
    if (processedTagIds.length > 0) {
      // Remove existing tags
      await ProductTag.destroy({
        where: { 
          product_id: product.product_id!,
          tag_id: {
            [Op.notIn]: processedTagIds
          }
        },
        transaction
      });
      
      // Add new tags (skip if already exists)
      await Promise.all(processedTagIds.map(async (tagId) => {
        await ProductTag.findOrCreate({
          where: {
            product_id: product.product_id!,
            tag_id: tagId
          },
          transaction
        });
      }));
    }

    // Update product with potential tag changes
    await product.update({
      product_name: product_name || product.product_name,
      description: description || product.description,
      price: price || product.price,
      primary_image_url: key || product.primary_image_url,
      space_id: space_id === "null" || space_id === null ? null : (space_id || product.space_id),
      collection_ids: collection_id || product.collection_ids,
      tag_ids: processedTagIds || product.tag_ids
    }, { transaction });

    await transaction.commit();

    return res.status(HTTP_STATUS.OK).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.UPDATED,
      data: {
        ...product.toJSON(),
        primary_image_url: primary_image_url,
        tags: processedTagIds,
      },
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating product:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};

// Delete product
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
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
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      type: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
};