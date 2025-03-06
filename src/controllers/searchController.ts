import { Request, Response } from 'express';
import { Product, Space, Collection, Tag } from "../models/index.js";
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import { Op } from 'sequelize';
import { getSignedDownloadUrl } from "../services/s3Service.js";

export const searchAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const filter = req.query.filter?.toString();
      const tag = req.query.tag?.toString();
      const owner_id = req.user?.user_id;

      if (!filter && !tag) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          type: RESPONSE_TYPES.ERROR,
          message: RESPONSE_MESSAGES.GENERIC.QUERY_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }
  
      // Base query for products
      let productQuery: any = {
        where: { owner_id },
        include: [{
          model: Tag,
          attributes: ['tag_id', 'tag_name'],
          through: { attributes: [] },
          as: 'Tags'
        }]
      };

      // If tag name is provided, add tag filter
      if (tag) {
        productQuery.include[0].where = {
          tag_name: { 
            [Op.like]: `%${tag.toLowerCase()}%` 
          }
        };
      }

      // If filter is provided, add text search conditions
      if (filter) {
        productQuery.where = {
          ...productQuery.where,
          [Op.or]: [
            { product_name: { [Op.like]: `%${filter}%` } },
            { description: { [Op.like]: `%${filter}%` } },
          ]
        };
      }

      // Search products with combined conditions
      const products = await Product.findAll(productQuery);
  
      // Search spaces (only if filter is provided)
      const spaces = filter ? await Space.findAll({
        where: {
          owner_id,
          [Op.or]: [
            { space_name: { [Op.like]: `%${filter}%` } },
            { description: { [Op.like]: `%${filter}%` } },
          ],
        },
      }) : [];
  
      // Search collections (only if filter is provided)
      const collections = filter ? await Collection.findAll({
        where: {
          owner_id,
          [Op.or]: [
            { collection_name: { [Op.like]: `%${filter}%` } },
            { description: { [Op.like]: `%${filter}%` } },
          ],
        },
      }) : [];

      // Process products to include tags and signed URLs
      const processedProducts = await Promise.all(products.map(async (product: any) => {
        const productJSON = product.toJSON();
        let product_space = null;

        if (product.space_id) {
          product_space = await Space.findOne({
            where: { owner_id, space_id: product.space_id },
            attributes: ["space_name"],
          });
        }

        return {
          ...productJSON,
          type: 'product',
          primary_image_url: productJSON.primary_image_url ? await getSignedDownloadUrl(productJSON.primary_image_url) : null,
          product_space: product_space?.getDataValue("space_name") || null,
          tags: productJSON.Tags?.map((tag: any) => ({
            tag_id: tag.tag_id,
            tag_name: tag.tag_name
          })) || []
        };
      }));

      // Combine results into a single array with type property
      const results = [
        ...processedProducts,
        ...spaces.map((space) => ({ ...space.toJSON(), type: 'space' })),
        ...collections.map((collection) => ({ ...collection.toJSON(), type: 'collection' })),
      ];
  
      return res.status(HTTP_STATUS.OK).json({
        type: RESPONSE_TYPES.SUCCESS,
        message: RESPONSE_MESSAGES.GENERIC.SEARCH_SUCCESS,
        data: { 
          results,
          total_count: results.length,
          filters_applied: {
            text: filter || null,
            tag: tag || null
          }
        },
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      console.error('Error searching:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }
  };