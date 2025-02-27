import { sequelize } from '../dist/models/index.js';

async function checkSchema() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Get the query interface
    const queryInterface = sequelize.getQueryInterface();

    // Check the structure of the tags table
    const tagsStructure = await queryInterface.describeTable('tags');
    console.log('Tags table structure:');
    console.log(JSON.stringify(tagsStructure, null, 2));

    // Check the structure of the products table
    const productsStructure = await queryInterface.describeTable('products');
    console.log('\nProducts table structure:');
    console.log(JSON.stringify(productsStructure, null, 2));

    // Check the structure of the products_tags table
    try {
      const productsTagsStructure = await queryInterface.describeTable('products_tags');
      console.log('\nProducts_Tags table structure:');
      console.log(JSON.stringify(productsTagsStructure, null, 2));
    } catch (error) {
      console.log('\nProducts_Tags table not found or error:', error.message);
    }

    // Check the structure of the categories table
    try {
      const categoriesStructure = await queryInterface.describeTable('categories');
      console.log('\nCategories table structure:');
      console.log(JSON.stringify(categoriesStructure, null, 2));
    } catch (error) {
      console.log('\nCategories table not found or error:', error.message);
    }

    // Close the connection
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

checkSchema();
