import { sequelize } from '../src/models/index.js';

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

    // Close the connection
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

checkSchema();
