import { Product, Space } from "../models/index.js";
import { uploadToS3 } from "../services/s3Service.js";
import path from "path";
export const createProduct = async (req, res) => {
    try {
        const { product_name, description, price, space_id, collection_id } = req.body;
        // Validate required fields
        if (!product_name || !description || !price || !req.file) {
            return res.status(400).json({
                error: "Missing required fields",
            });
        }
        // Upload image to S3
        const fileExtension = path.extname(req.file.originalname);
        const key = `products/${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}${fileExtension}`;
        let primary_image_url;
        try {
            primary_image_url = await uploadToS3(req.file, key);
        }
        catch (error) {
            console.error("Error uploading to S3:", error);
            return res.status(500).json({
                error: "Failed to upload image",
            });
        }
        // Get owner_id from authenticated user
        const owner_id = req.user.user_id;
        // If space_id is provided, validate it exists
        if (space_id) {
            const space = await Space.findByPk(space_id);
            if (!space) {
                return res.status(400).json({
                    error: "Invalid space_id provided",
                });
            }
        }
        // Create the product
        const product = await Product.create({
            product_name,
            description,
            price,
            primary_image_url,
            space_id,
            owner_id,
            collection_ids: collection_id ? [collection_id] : [],
        });
        return res.status(201).json({
            message: "Product created successfully",
            product_id: product.product_id,
            product_name: product.product_name,
            primary_image_url: product.primary_image_url,
        });
    }
    catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
export const getAllProducts = async (req, res) => {
    try {
        console.log(req.query, "query");
        const products = await Product.findAll({
            attributes: [
                "product_id",
                "product_name",
                "description",
                "price",
                "primary_image_url",
            ],
        });
        return res.status(200).json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            attributes: [
                "product_id",
                "product_name",
                "description",
                "price",
                "primary_image_url",
                "space_id",
            ],
        });
        if (!product) {
            return res.status(404).json({
                error: "Product not found",
            });
        }
        return res.status(200).json(product);
    }
    catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, description, price, space_id, collection_id } = req.body;
        // Find the product
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                error: "Product not found",
            });
        }
        // Optional: Check if the user has permission to update this product
        const owner_id = req.user.user_id;
        if (product.owner_id !== owner_id) {
            return res.status(403).json({
                error: "You do not have permission to update this product",
            });
        }
        // Handle image update if a new file is uploaded
        let primary_image_url = product.primary_image_url;
        if (req.file) {
            const fileExtension = path.extname(req.file.originalname);
            const key = `products/${Date.now()}-${Math.random()
                .toString(36)
                .substring(7)}${fileExtension}`;
            try {
                primary_image_url = await uploadToS3(req.file, key);
            }
            catch (error) {
                console.error("Error uploading to S3:", error);
                return res.status(500).json({
                    error: "Failed to upload image",
                });
            }
        }
        // If space_id is provided, validate it exists
        if (space_id) {
            const space = await Space.findByPk(space_id);
            if (!space) {
                return res.status(400).json({
                    error: "Invalid space_id provided",
                });
            }
        }
        // Update the product
        await product.update({
            product_name: product_name || product.product_name,
            description: description || product.description,
            price: price || product.price,
            primary_image_url,
            space_id: space_id || product.space_id,
            collection_ids: collection_id ? [collection_id] : product.collection_ids,
        });
        return res.status(200).json({
            message: "Product updated successfully",
            product_id: product.product_id,
            product_name: product.product_name,
            primary_image_url: primary_image_url,
        });
    }
    catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Find the product
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                error: "Product not found",
            });
        }
        // Optional: Check if the user has permission to delete this product
        const owner_id = req.user.user_id;
        if (product.owner_id !== owner_id) {
            return res.status(403).json({
                error: "You do not have permission to delete this product",
            });
        }
        // Delete the product
        await product.destroy();
        return res.status(200).json({
            message: "Product deleted successfully",
            product_id: id,
        });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
//# sourceMappingURL=productController.js.map