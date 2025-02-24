import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
// src/database/migrate.ts
import fs from 'fs/promises';
import path from 'path';
import { sequelize } from '../models/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function getCurrentSchemaVersion() {
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS schema_versions (
                version INT PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description VARCHAR(255)
            )
        `);
        const [result] = await sequelize.query('SELECT MAX(version) as version FROM schema_versions');
        return result[0]?.version || 0;
    }
    catch (error) {
        console.error('Error getting schema version:', error);
        return 0;
    }
}
async function columnExists(tableName, columnName) {
    try {
        const [columns] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = ? 
            AND COLUMN_NAME = ?
            AND TABLE_SCHEMA = ?`, {
            replacements: [tableName, columnName, process.env.DB_NAME]
        });
        return columns.length > 0;
    }
    catch (error) {
        console.error('Error checking column existence:', error);
        return false;
    }
}
async function executeMigration(sql) {
    // Split SQL into individual statements
    const statements = sql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0 && !statement.startsWith('--'));
    for (const statement of statements) {
        if (statement.toLowerCase().includes('add column')) {
            // Extract table and column name from ADD COLUMN statement
            const matches = statement.match(/ALTER TABLE (\w+)\s+ADD COLUMN (\w+)/i);
            if (matches) {
                const [, tableName, columnName] = matches;
                const exists = await columnExists(tableName, columnName);
                if (exists) {
                    console.log(`Column ${columnName} already exists in ${tableName}, skipping...`);
                    continue;
                }
            }
        }
        await sequelize.query(statement + ';');
    }
}
async function runMigrations() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        const currentVersion = await getCurrentSchemaVersion();
        console.log('Current schema version:', currentVersion);
        const migrationFiles = await fs.readdir(path.join(__dirname, 'migrations'));
        const sqlFiles = migrationFiles.filter(f => f.endsWith('.sql')).sort();
        console.log('Found migration files:', sqlFiles);
        for (const file of sqlFiles) {
            const version = parseInt(file.split('_')[0], 10);
            const description = file.split('_').slice(1).join('_').replace('.sql', '');
            if (version > currentVersion) {
                const migrationPath = path.join(__dirname, 'migrations', file);
                const migrationSql = await fs.readFile(migrationPath, 'utf8');
                try {
                    await sequelize.transaction(async (t) => {
                        await executeMigration(migrationSql);
                        await sequelize.query('INSERT INTO schema_versions (version, description) VALUES (?, ?)', {
                            replacements: [version, description],
                            transaction: t
                        });
                    });
                    console.log(`Successfully applied migration: ${file}`);
                }
                catch (error) {
                    console.error(`Error applying migration ${file}:`, error);
                    throw error;
                }
            }
            else {
                console.log(`Skipping already executed migration: ${file}`);
            }
        }
        console.log('All migrations completed successfully');
    }
    catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}
runMigrations()
    .then(() => {
    console.log('Migration process completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map