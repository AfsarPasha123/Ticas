import { Product, Space } from '../models/index.js';
import { uploadToS3 } from '../services/s3Service.js';
import path from 'path';
export const createProduct = async (req, res) => {
    try {
        const { product_name, description, price, space_id, collection_id } = req.body;
        // Validate required fields
        if (!product_name || !description || !price || !req.file) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }
        // Upload image to S3
        const fileExtension = path.extname(req.file.originalname);
        const key = `products/${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
        let primary_image_url;
        try {
            primary_image_url = await uploadToS3(req.file, key);
        }
        catch (error) {
            console.error('Error uploading to S3:', error);
            return res.status(500).json({
                error: "Failed to upload image"
            });
        }
        // Get owner_id from authenticated user
        const owner_id = req.user.user_id;
        // If space_id is provided, validate it exists
        if (space_id) {
            const space = await Space.findByPk(space_id);
            if (!space) {
                return res.status(400).json({
                    error: "Invalid space_id provided"
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
            collection_ids: collection_id ? [collection_id] : []
        });
        return res.status(201).json({
            message: "Product created successfully",
            product_id: product.product_id,
            product_name: product.product_name,
            primary_image_url: product.primary_image_url
        });
    }
    catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};
//# sourceMappingURL=productController.js.map