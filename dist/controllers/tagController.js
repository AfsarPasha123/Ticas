import { Tag, sequelize } from "../models/index.js";
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from "../constants/responseConstants.js";
import { Op } from "sequelize";
// Get all tags
export const getAllTags = async (_req, res) => {
    try {
        const tags = await Tag.findAll({
            order: [["name", "ASC"]],
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: "Tags retrieved successfully",
            data: tags,
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error retrieving tags:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Create a new tag
export const createTag = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.MISSING_FIELDS,
                status: HTTP_STATUS.BAD_REQUEST,
            });
        }
        // Check if tag already exists
        const existingTag = await Tag.findOne({
            where: {
                name: {
                    [Op.like]: name,
                },
            },
        });
        if (existingTag) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                type: RESPONSE_TYPES.ERROR,
                message: "Tag already exists",
                status: HTTP_STATUS.CONFLICT,
            });
        }
        const newTag = await Tag.create({
            name,
        });
        return res.status(HTTP_STATUS.CREATED).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: "Tag created successfully",
            data: newTag,
            status: HTTP_STATUS.CREATED,
        });
    }
    catch (error) {
        console.error("Error creating tag:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Delete a tag
export const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await Tag.findByPk(id);
        if (!tag) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                type: RESPONSE_TYPES.ERROR,
                message: "Tag not found",
                status: HTTP_STATUS.NOT_FOUND,
            });
        }
        await tag.destroy();
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: "Tag deleted successfully",
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error deleting tag:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Search tags
export const searchTags = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                type: RESPONSE_TYPES.ERROR,
                message: "Search query is required",
                status: HTTP_STATUS.BAD_REQUEST,
            });
        }
        const tags = await Tag.findAll({
            where: {
                name: {
                    [Op.like]: `%${query}%`,
                },
            },
            order: [["name", "ASC"]],
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: "Tags retrieved successfully",
            data: tags,
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error searching tags:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Get suggested/popular tags
export const getSuggestedTags = async (_req, res) => {
    try {
        // Define categories for suggested tags
        const categories = {
            "Product Type": ["fashion", "electronics", "home", "kitchen", "office", "sports", "outdoor"],
            "Style": ["wearable", "party-wear", "casual", "formal", "seasonal"],
            "Quality": ["luxury", "budget", "vintage", "modern"]
        };
        // Get all tags from the database to check which ones exist
        const existingTags = await Tag.findAll({
            where: {
                name: {
                    [Op.in]: Object.values(categories).flat()
                }
            }
        });
        // Create a map of existing tag names for quick lookup
        const existingTagNames = new Set(existingTags.map(tag => tag.getDataValue("name")));
        // Filter categories to only include tags that exist in the database
        const filteredCategories = {};
        for (const [category, tags] of Object.entries(categories)) {
            const existingCategoryTags = tags.filter(tag => existingTagNames.has(tag));
            if (existingCategoryTags.length > 0) {
                filteredCategories[category] = existingCategoryTags;
            }
        }
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: "Suggested tags retrieved successfully",
            data: filteredCategories,
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error retrieving suggested tags:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
// Get popular tags based on usage
export const getPopularTags = async (req, res) => {
    try {
        const owner_id = req.user?.user_id;
        const limit = parseInt(req.query.limit) || 10;
        // Get tags ordered by usage count (number of products associated with each tag)
        const popularTags = await Tag.findAll({
            attributes: [
                'id',
                'name',
                [
                    // Count the number of products associated with this tag
                    // that belong to the current user
                    sequelize.literal(`(
            SELECT COUNT(*)
            FROM product_tags pt
            JOIN products p ON pt.product_id = p.product_id
            WHERE pt.tag_id = Tag.id
            AND p.owner_id = ${owner_id}
          )`),
                    'usage_count'
                ]
            ],
            order: [
                [sequelize.literal('usage_count'), 'DESC']
            ],
            limit: limit
        });
        return res.status(HTTP_STATUS.OK).json({
            type: RESPONSE_TYPES.SUCCESS,
            message: "Popular tags retrieved successfully",
            data: popularTags,
            status: HTTP_STATUS.OK,
        });
    }
    catch (error) {
        console.error("Error retrieving popular tags:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            type: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        });
    }
};
//# sourceMappingURL=tagController.js.map