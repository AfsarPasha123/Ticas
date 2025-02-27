import { Category, Tag, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
// Get all categories
export const getAllCategories = async (_req, res) => {
    try {
        const categories = await Category.findAll({
            include: [
                {
                    model: Tag,
                    through: { attributes: [] } // Don't include junction table data
                }
            ]
        });
        return res.status(200).json(categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
// Get a single category by ID
export const getCategoryById = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }
        const category = await Category.findByPk(categoryId, {
            include: [
                {
                    model: Tag,
                    through: { attributes: [] }
                }
            ]
        });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        return res.status(200).json(category);
    }
    catch (error) {
        console.error('Error fetching category:', error);
        return res.status(500).json({ error: 'Failed to fetch category' });
    }
};
// Create a new category
export const createCategory = async (req, res) => {
    try {
        const { category_name, tags } = req.body;
        if (!category_name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        // Create the category
        const [category, created] = await Category.findOrCreate({
            where: { category_name: category_name.trim() }
        });
        if (!created) {
            return res.status(409).json({ error: 'Category already exists', category });
        }
        // If tags are provided, associate them with the category
        if (tags && Array.isArray(tags) && tags.length > 0) {
            // Find or create each tag
            const tagObjects = await Promise.all(tags.map(async (tagName) => {
                const [tag] = await Tag.findOrCreate({
                    where: { name: tagName.toLowerCase().trim() }
                });
                return tag;
            }));
            // Associate tags with the category using direct SQL queries
            for (const tag of tagObjects) {
                await sequelize.query('INSERT INTO category_tags (category_id, tag_id) VALUES (?, ?)', {
                    replacements: [category.category_id, tag.id]
                });
            }
        }
        // Fetch the category with its tags to return in the response
        const categoryWithTags = await Category.findByPk(category.category_id, {
            include: [
                {
                    model: Tag,
                    through: { attributes: [] }
                }
            ]
        });
        return res.status(201).json(categoryWithTags);
    }
    catch (error) {
        console.error('Error creating category:', error);
        return res.status(500).json({ error: 'Failed to create category' });
    }
};
// Update a category
export const updateCategory = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const { category_name, tags } = req.body;
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }
        // Find the category
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        // Update category name if provided
        if (category_name) {
            // Check if the new name already exists in another category
            const existingCategory = await Category.findOne({
                where: {
                    category_name: category_name.trim(),
                    category_id: { [Op.ne]: categoryId }
                }
            });
            if (existingCategory) {
                return res.status(409).json({ error: 'Category name already exists' });
            }
            category.category_name = category_name.trim();
            await category.save();
        }
        // Update tags if provided
        if (tags && Array.isArray(tags)) {
            // Find or create each tag
            const tagObjects = await Promise.all(tags.map(async (tagName) => {
                const [tag] = await Tag.findOrCreate({
                    where: { name: tagName.toLowerCase().trim() }
                });
                return tag;
            }));
            // Replace all existing tags with the new ones
            await category.setTags(tagObjects);
        }
        // Fetch the updated category with its tags
        const updatedCategory = await Category.findByPk(categoryId, {
            include: [
                {
                    model: Tag,
                    through: { attributes: [] }
                }
            ]
        });
        return res.status(200).json(updatedCategory);
    }
    catch (error) {
        console.error('Error updating category:', error);
        return res.status(500).json({ error: 'Failed to update category' });
    }
};
// Delete a category
export const deleteCategory = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }
        // Find the category
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        // Delete the category (associations will be automatically removed due to CASCADE)
        await category.destroy();
        return res.status(200).json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ error: 'Failed to delete category' });
    }
};
//# sourceMappingURL=categoryController.js.map