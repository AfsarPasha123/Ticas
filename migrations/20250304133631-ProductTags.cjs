'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('product_tags', {
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'products',
          key: 'product_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tag_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'tag_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add a unique constraint to prevent duplicate associations
    await queryInterface.addConstraint('product_tags', {
      fields: ['product_id', 'tag_id'],
      type: 'unique',
      name: 'unique_product_tag_association'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the unique constraint first
    await queryInterface.removeConstraint('product_tags', 'unique_product_tag_association');
    
    // Then drop the table
    await queryInterface.dropTable('product_tags');
  }
};