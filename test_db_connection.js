import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test connection function
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connection has been established successfully.');
        
        // Optional: Check database details
        const [results] = await sequelize.query('SELECT VERSION() as mysql_version');
        console.log('MySQL Version:', results[0].mysql_version);
        
        // List all databases
        const [databases] = await sequelize.query('SHOW DATABASES');
        console.log('Available Databases:', databases.map(db => db.Database));
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the test
testConnection();
