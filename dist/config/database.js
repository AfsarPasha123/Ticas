import mysql from 'mysql2/promise';
import config from './environment.js';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const dbConfig = {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
};
console.log(`Attempting to connect to database (${config.env} environment):`, {
    ...dbConfig,
    password: dbConfig.password ? '****' : undefined
});
// Create the initial connection
const connection = await mysql.createConnection(dbConfig);
// Initialize database
async function initDatabase() {
    try {
        console.log('Starting database initialization...');
        // Create database if it doesn't exist
        console.log(`Creating database ${config.database.name} if it doesn't exist...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database.name}`);
        console.log(`Switching to database ${config.database.name}...`);
        await connection.query(`USE ${config.database.name}`);
        // Create users table
        console.log('Creating users table if it doesn\'t exist...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255) NOT NULL,
                phone_number BIGINT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Create spaces table
        console.log('Creating spaces table if it doesn\'t exist...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS spaces (
                space_id INT PRIMARY KEY AUTO_INCREMENT,
                space_name VARCHAR(255) NOT NULL,
                description TEXT,
                owner_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(user_id)
            )
        `);
        console.log('Database initialization completed successfully.');
    }
    catch (error) {
        console.error('Error during database initialization:', error);
        throw error;
    }
}
// Initialize database
try {
    await initDatabase();
    console.log('Database setup completed successfully');
}
catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}
// Create the connection pool for the application
const pool = mysql.createPool(dbConfig);
// Close the initialization connection
await connection.end();
// Test the connection
pool.getConnection()
    .then(connection => {
    console.log(`Successfully connected to ${config.database.name} database`);
    connection.release();
})
    .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
});
export default pool;
//# sourceMappingURL=database.js.map