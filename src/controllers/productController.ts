import { Collection, Product, Space } from "../models/index.js";
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  RESPONSE_TYPES,
} from "../constants/responseConstants.js";
import { Request, Response } from "express";
import { getSignedDownloadUrl, uploadToS3 } from "../services/s3Service.js";
import { Sequelize } from 'sequelize';
import { Op } from "sequelize";
import path from "path";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Create a new product
export const createProduct = async (
  req: MulterRequest,
  res: Response
): Promise<Response> => {
  try {
    const { product_name, description, price, space_id } = req.body;
    const image = req.file;
    let { collection_id } = req.body;
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    console.log("coming in here?")

    if (!product_name || !image) {
      console.log("Missing fields:", { product_name, image });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    // Check if space exists
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

    let primary_image_url = "";
    let key=""
    if (image) {
      const fileExtension = path.extname(image.originalname);
      key = `products/${Date.now()}${fileExtension}`;
      primary_image_url = await uploadToS3(image, key);
    }

    const product = await Product.create({
      product_name,
      description: description || "",
      price,
      space_id,
      primary_image_url: key,
      collection_ids: collection_id ? collection_id : [],
      owner_id: req.user?.user_id || 0, // This should be handled by auth middleware
    });

    return res.status(HTTP_STATUS.CREATED).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.CREATED,
      data: {
        ...product.toJSON(),
        primary_image_url: primary_image_url,
      },
      status: HTTP_STATUS.CREATED,
    });
  } catch (error) {
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
        "donation_status", // Include donation status in the response
        "space_id",
      ],
    });

    console.log("Products", products);

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
      if (product.toJSON().space_id) {
        product_space = await Space.findOne({
          where: { owner_id, space_id: product.toJSON().space_id },
          attributes: ["space_name"],
        })
      }
      
      const productJSON = product.toJSON();
      if (!productJSON.donation_status) {
        delete productJSON.donation_status;
      }
      return {
        ...productJSON,
        primary_image_url: product?.primary_image_url ? await getSignedDownloadUrl(product?.primary_image_url!) : null,
        product_space: product_space ? product_space?.getDataValue("space_name") : null,
      };
    }));

    console.log("Customized Products", customizedProducts);

    return res.status(HTTP_STATUS.OK).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
      data: {
        products: customizedProducts, // Use customized products
        totalWorth: totalWorth.toFixed(2), // Include total worth in the response
        totalCount: totalCount, // Include total product count in the response
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
    if (!productJSON.donation_status) {
      delete productJSON.donation_status;
    }

    return res.status(HTTP_STATUS.OK).json({
      type: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
      data: {
        ...productJSON,
        collection_names: collection.map((item) => item.getDataValue("collection_name")),
        space_name: space?.getDataValue("space_name"),
        primary_image_url: product?.primary_image_url ? await getSignedDownloadUrl(product?.primary_image_url!):null,
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

export const updateProduct = async (
  req: MulterRequest,
  res: Response
): Promise<Response> => {
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
      collection_id = collection_id.map((id: any) => parseInt(id, 10));
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

// Check if the new space exists
if (space_id !== null && space_id !== "null" && space_id !== undefined) {
  const space = await Space.findByPk(space_id);
  if (!space) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
          type: RESPONSE_TYPES.ERROR,
          message: RESPONSE_MESSAGES.SPACE.NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND,
      });
  }
}

// Handle space updates
if (space_id === null || space_id === "null" || space_id === undefined) {
  product.space_id = null;
} else if (space_id !== product.space_id) {
  // Remove product from the old space if it exists
  if (product.space_id) {
      try {
          await Space.update(
              { products: Sequelize.fn('array_remove', Sequelize.col('products'), product_id) },
              { where: { space_id: product.space_id } }
          );
      } catch (spaceError) {
          console.error("Error updating space:", spaceError);
      }
  }
  product.space_id = space_id;
}

// Update product details
await product.update({
  product_name: product_name || product.product_name,
  description: description || product.description,
  price: price || product.price,
  primary_image_url: key || product.primary_image_url,
  space_id: space_id === "null" || space_id === null ? null : (space_id || product.space_id),
  collection_ids: collection_id || product.collection_ids
});

    // Handle collection updates
    if (collection_id) {
      // Normalize collection_id to array
      if (!Array.isArray(collection_id)) {
        collection_id = [collection_id];
      }
      collection_id = collection_id.map((id: any) => parseInt(id, 10));

      // Validate all new collections exist
      for (const id of collection_id) {
        const collection = await Collection.findByPk(id);
        if (!collection) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.COLLECTION.NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND,
          });
        }
      }

      // Find collections to remove (in current but not in new)
      const collectionsToRemove = (product.collection_ids || [])
        .filter((id: number) => !collection_id.includes(id));

      // Find collections to add (in new but not in current)
      const collectionsToAdd = collection_id
        .filter((id: number) => !(product.collection_ids || []).includes(id));

      console.log(`Removing product from collections: ${collectionsToRemove}`);
      console.log(`Adding product to collections: ${collectionsToAdd}`);
    }

    // Update product details
    // Update product details
  await product.update({
    product_name: product_name || product.product_name,
    description: description || product.description,
    price: price || product.price,
    primary_image_url: key || product.primary_image_url,
    space_id: space_id === undefined ? product.space_id : space_id, // Fix this line
    collection_ids: collection_id || product.collection_ids
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
  } catch (error) {
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