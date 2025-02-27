import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { sequelize } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function getCurrentSchemaVersion(): Promise<number> {
    try {
        const [result] = await sequelize.query('SELECT MAX(version) as version FROM schema_versions');
        return (result as any)[0]?.version || 0;
    } catch (error) {
        // Table doesn't exist yet
        return 0;
    }
}

async function getMigrationFiles(): Promise<string[]> {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        return files
            .filter(f => f.endsWith('.sql'))
            .sort(); // Ensures migrations run in order
    } catch (error) {
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

        // Synchronize all models with the database
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');

        // Optional: Run any additional initialization or migration scripts
        const currentVersion = await getCurrentSchemaVersion();
        console.log('Current database schema version:', currentVersion);

        const migrationFiles = await getMigrationFiles();

        for (const file of migrationFiles) {
            const migrationPath = path.join(__dirname, 'migrations', file);
            const migrationSql = await fs.readFile(migrationPath, 'utf-8');
            await sequelize.query(migrationSql);
        }

        console.log('Database initialization complete.');
    } catch (error) {
        console.error('Unable to initialize database:', error);
        throw error;
    }
}

// Run the initialization
initializeDatabase();
