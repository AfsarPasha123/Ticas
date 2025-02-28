'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    await queryInterface.addColumn('products', 'donation_status', {
      type: Sequelize.ENUM('in_donation', 'donated'),
                allowNull: true,
                defaultValue: null,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
    */
    await queryInterface.removeColumn('products', 'new_column');
  },
  
};
