'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('products', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '',
    });
    await queryInterface.changeColumn('products', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    });
    await queryInterface.changeColumn('products', 'primary_image_url', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    })
    await queryInterface.changeColumn('products', 'space_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('products', 'description', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.changeColumn('products', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
    await queryInterface.changeColumn('products', 'primary_image_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.changeColumn('products', 'space_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    })
  }
};
