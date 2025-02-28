'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    await queryInterface.changeColumn('products', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '',
    });
    await queryInterface.changeColumn('products', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.changeColumn('products', 'primary_image_url', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
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
  }
};
