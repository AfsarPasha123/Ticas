import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { sequelize } from '../models/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function getCurrentSchemaVersion() {
    try {
        const [result] = await sequelize.query('SELECT MAX(version) as version FROM schema_versions');
        return result[0]?.version || 0;
    }
    catch (error) {
        // Table doesn't exist yet
        return 0;
    }
}
async function getMigrationFiles() {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        return files
            .filter(f => f.endsWith('.sql'))
            .sort(); // Ensures migrations run in order
    }
    catch (error) {
        console.error('Error reading migration files:', error);
        return [];
    }
}
async function initializeDatabase() {
    try {
        // Test the connection
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        // Create database if it doesn't exist
        await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await sequelize.query(`USE ${process.env.DB_NAME}`);
        // Drop existing tables in correct order
        try {
            await sequelize.query('DROP TABLE IF EXISTS spaces');
            await sequelize.query('DROP TABLE IF EXISTS users');
            await sequelize.query('DROP TABLE IF EXISTS schema_versions');
            console.log('Existing tables dropped successfully');
        }
        catch (error) {
            console.error('Error dropping tables:', error);
        }
        // Get current schema version and available migration files
        const currentVersion = await getCurrentSchemaVersion();
        console.log('Current schema version:', currentVersion);
        const migrationFiles = await getMigrationFiles();
        console.log('Found migration files:', migrationFiles);
        // Apply migrations
        for (const file of migrationFiles) {
            const migrationPath = path.join(__dirname, 'migrations', file);
            const migrationSql = await fs.readFile(migrationPath, 'utf8');
            try {
                // Execute the migration
                await sequelize.query(migrationSql);
                console.log(`Applied migration: ${file}`);
            }
            catch (error) {
                console.error(`Error applying migration ${file}:`, error);
                throw error;
            }
        }
        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Database initialization completed successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}
// Run the initialization
initializeDatabase();
//# sourceMappingURL=initDb.js.map