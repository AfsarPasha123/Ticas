// import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from "../constants/responseConstants";
import { Request, Response } from "express";
import { deleteFromS3, uploadToS3 } from "../services/s3Service.js";

import axios from "axios";
import dotenv from "dotenv"
import express from "express"
import multer from "multer";
import path from "path";

dotenv.config();

const serpApiSearchRouter = express.Router();
const serp_api_endpoint = "https://serpapi.com/search"
// File filter for images
const fileFilter = (
    _req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
        "image/tiff",
        "image/avif",
        "image/svg+xml"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only JPEG, JPG, PNG, GIF, BMP, WEBP, TIFF, and SVG images are allowed."
              )
        );
    }
};

const upload = multer({
    storage: multer.memoryStorage(), fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Endpoint to handle image uploads
serpApiSearchRouter.post('/', upload.single('search_image'), async (req: Request, res: Response) => {
    try {
        // 1. Get the uploaded image
        if (!req.file) {
            return res.status(400).json({
                type: "Error",
                status: 400,
                message: "No image file uploaded",
            });
        }

        const search_image = req?.file;
        let key: null | string = ""
        let uploadedImageUrl: string | null = ""
        if (search_image) {
            const fileExtension = path.extname(search_image.originalname);
            key = `search_serp_images/${Date.now()}${fileExtension}`;
            uploadedImageUrl = await uploadToS3(search_image, key);
        }


        // Sending to SERP API (Google Lens equivalent)
        const serpResponse = await axios.get(serp_api_endpoint, {
            params: {
                api_key: process.env.SERP_PRIVATE_KEY,
                engine: 'google_lens',
                url: uploadedImageUrl,
                hl: "en",
                country: "us"
            }
        });


        // deleting image once after response from serp api cause either sucess or error we have to delete user can reupload pic 
        if (serpResponse) {
            try {
                await deleteFromS3(key)
            } catch (deleteError) {
                console.error(
                    "Failed to delete uploaded image",
                    deleteError
                );
            }
        }

        // 3. Extract product data from response
        const productData = serpResponse.data.visual_matches
            .filter((item: any) => item.price && item.price.currency === "$")
            .map((item: any) => ({
                title: item?.title || "N/A",
                link: item?.link || "N/A",
                source: item?.source || "N/A",
                price: item?.price || "N/A",
                thumbnail: item?.thumbnail || "N/A",
            }));

        // 4. Return formatted product data
        res.status(200).json({
            type: "Success",
            status: 200,
            message: "Search results fetched successfully.",
            data: productData
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json(
            {
                message: "Resource not found.",
                type: "Error",
                status: 500,
            }
        );
    }
});

export default serpApiSearchRouter;