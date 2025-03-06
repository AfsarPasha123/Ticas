import { Tag, ProductTag, sequelize } from '../models/index.js';
export const tagController = {
    // Get all tags
    async getAllTags(_req, res) {
        try {
            const tags = await Tag.findAll({
                attributes: ['tag_id', 'tag_name'],
                order: [['tag_name', 'ASC']]
            });
            res.json(tags);
        }
        catch (error) {
            console.error('Error fetching tags:', error);
            res.status(500).json({
                message: 'Failed to retrieve tags',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    // Create a new tag
    async createTag(req, res) {
        try {
            const { tag_name } = req.body;
            // Validate tag name
            if (!tag_name || tag_name.trim() === '') {
                return res.status(400).json({ message: 'Tag name is required' });
            }
            // Check if tag already exists
            const [tag, created] = await Tag.findOrCreate({
                where: {
                    tag_name: tag_name.trim().toLowerCase()
                },
                defaults: {
                    tag_name: tag_name.trim().toLowerCase()
                }
            });
            res.status(created ? 201 : 200).json({
                message: created ? 'Tag created successfully' : 'Tag already exists',
                tag
            });
        }
        catch (error) {
            console.error('Error creating tag:', error);
            res.status(500).json({
                message: 'Failed to create tag',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    // Update an existing tag
    async updateTag(req, res) {
        try {
            const { tag_id } = req.params;
            const { tag_name } = req.body;
            // Validate inputs
            if (!tag_name || tag_name.trim() === '') {
                return res.status(400).json({ message: 'Tag name is required' });
            }
            const tag = await Tag.findByPk(tag_id);
            if (!tag) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            // Update tag
            tag.tag_name = tag_name.trim().toLowerCase();
            await tag.save();
            res.json({
                message: 'Tag updated successfully',
                tag
            });
        }
        catch (error) {
            console.error('Error updating tag:', error);
            res.status(500).json({
                message: 'Failed to update tag',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    // Delete a tag
    async deleteTag(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { tag_id } = req.params;
            // Find the tag
            const tag = await Tag.findByPk(tag_id, { transaction });
            if (!tag) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Tag not found' });
            }
            // Remove tag associations with products
            await ProductTag.destroy({
                where: { tag_id: tag_id },
                transaction
            });
            // Delete the tag
            await tag.destroy({ transaction });
            await transaction.commit();
            res.json({ message: 'Tag deleted successfully' });
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error deleting tag:', error);
            res.status(500).json({
                message: 'Failed to delete tag',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};
//# sourceMappingURL=tagController.js.map