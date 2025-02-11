import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { Collection } from "../models/Collection.js";
import { Product } from "../models/index.js";
import { sequelize, QueryTypes } from "../models/index.js";
import "../types";

// Create a new collection
export const createCollection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("Create Collection Request Received");
  console.log("Request Body:", req.body);
  console.log("Authenticated User:", req.user);

  try {
    const { collection_name, description } = req.body;

    // Get the user ID from the authenticated request
    const owner_id = req.user?.user_id;

    if (!owner_id) {
      console.error("No owner_id found in authenticated request");
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Create the collection
    const newCollection = await Collection.create({
      collection_name,
      description,
      owner_id,
    });

    console.log("Collection created successfully:", newCollection.toJSON());

    res.status(201).json({
      message: "Collection created successfully.",
      collection_id: newCollection.collection_id,
      collection_name: newCollection.collection_name,
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    res
      .status(400)
      .json({ error: "Invalid data provided.", details: String(error) });
  }
};

// Get collection details
export const getCollectionDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Find the collection
    const collection = await Collection.findByPk(id);

    if (!collection) {
      return res.status(404).json({ error: "Collection not found." });
    }

    // Get collection details using a raw SQL query for performance
    const [results] = await sequelize.query(
      `
      SELECT 
        COUNT(DISTINCT p.product_id) as total_items,
        COALESCE(SUM(p.price), 0) as total_worth,
        COUNT(DISTINCT t.tag_name) as total_tags
      FROM collections c
      LEFT JOIN product_collections pc ON c.collection_id = pc.collection_id
      LEFT JOIN products p ON pc.product_id = p.product_id
      LEFT JOIN product_tags t ON p.product_id = t.product_id
      WHERE c.collection_id = :collectionId
    `,
      {
        replacements: { collectionId: id },
        type: QueryTypes.SELECT,
      }
    );

    interface CollectionDetails {
      total_items: number;
      total_worth: number;
      total_tags: number;
    }

    const details = results as CollectionDetails[];

    res.status(200).json({
      collection_id: collection.collection_id,
      collection_name: collection.collection_name,
      last_updated: collection.last_updated,
      total_items: details[0].total_items,
      total_worth: parseFloat(details[0].total_worth.toFixed(2)),
      total_tags: details[0].total_tags,
    });
  } catch (error) {
    console.error("Error fetching collection details:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again later." });
  }
};

// Get all products in a collection
export const getCollectionProducts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Find the collection
    const collection = await Collection.findByPk(id);

    if (!collection) {
      return res.status(404).json({ error: "Collection not found." });
    }

    // Find products in the collection
    const products = await Product.findAll({
      include: [
        {
          model: Collection,
          where: { collection_id: id },
          through: { attributes: [] }, // Exclude join table attributes
        },
      ],
      attributes: ["product_id", "product_name", "price"],
    });

    res.status(200).json({
      collection_id: collection.collection_id,
      collection_name: collection.collection_name,
      total_products: products.length,
      products: products.map((product) => ({
        product_id: product.product_id,
        product_name: product.product_name,
        price: product.price,
      })),
    });
  } catch (error) {
    console.error("Error fetching collection products:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again later." });
  }
};

// Get collections for a user
export const getUserCollections = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { owner_id } = req.query;

    if (!owner_id) {
      return res.status(400).json({ error: "Invalid or missing user_id." });
    }

    // Find collections for the user
    const collections = await Collection.findAll({
      where: { owner_id: Number(owner_id) },
      attributes: ["collection_id", "collection_name", "description"],
    });

    res.status(200).json({
      total_collections: collections.length,
      collections: collections,
    });
  } catch (error) {
    console.error("Error fetching user collections:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again later." });
  }
};

// Generate test collection data (only for development)
export const generateTestCollectionData = async (
  _req: AuthenticatedRequest,
  _res: Response
) => {
  // ... existing code remains the same ...
};
