import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

async function testDatabaseConnection() {
  console.log('Testing Database Connection...');
  console.log('Database Configuration:');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);

  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: console.log,
  });

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Optional: List all tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('Tables in the database:');
    console.log(tables);

  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    }
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
