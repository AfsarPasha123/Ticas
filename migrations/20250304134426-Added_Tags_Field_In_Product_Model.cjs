'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      },
      primary_image_url: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      space_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'spaces',
          key: 'space_id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      collection_ids: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      donation_status: {
        type: Sequelize.ENUM('in_donation', 'donated'),
        allowNull: true,
        defaultValue: null
      }
    });

    // Optional: Add index for performance optimization
    await queryInterface.addIndex('products', ['owner_id', 'space_id'], {
      name: 'idx_products_owner_space'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the index first
    await queryInterface.removeIndex('products', 'idx_products_owner_space');
    
    // Then drop the table
    await queryInterface.dropTable('products');
  }
};