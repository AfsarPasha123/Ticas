import { Request, Response } from 'express';
import { Product, Space, Collection } from "../models/index.js";
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import { Op } from 'sequelize';

export const searchAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { filter } = req?.query;

      if (!filter) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          type: RESPONSE_TYPES.ERROR,
          message: RESPONSE_MESSAGES.GENERIC.QUERY_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }
  
      // Search products
      const products = await Product.findAll({
        where: {
          [Op.or]: [
            { product_name: { [Op.like]: `%${filter}%` } },
            { description: { [Op.like]: `%${filter}%` } },
          ],
        },
      });
  
      // Search spaces
      const spaces = await Space.findAll({
        where: {
          [Op.or]: [
            { space_name: { [Op.like]: `%${filter}%` } },
            { description: { [Op.like]: `%${filter}%` } },
          ],
        },
      });
  
      // Search collections
      const collections = await Collection.findAll({
        where: {
          [Op.or]: [
            { collection_name: { [Op.like]: `%${filter}%` } },
            { description: { [Op.like]: `%${filter}%` } },
          ],
        },
      });

      // Combine results into a single array with type property
        const results = [
        ...products.map((product) => ({ ...product.toJSON(), type: 'product' })),
        ...spaces.map((space) => ({ ...space.toJSON(), type: 'space' })),
        ...collections.map((collection) => ({ ...collection.toJSON(), type: 'collection' })),
      ];
  
      return res.status(HTTP_STATUS.OK).json({
        type: RESPONSE_TYPES.SUCCESS,
        message: RESPONSE_MESSAGES.GENERIC.SEARCH_SUCCESS,
        data: { results },
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      console.error('Error searching:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        type: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }
  };