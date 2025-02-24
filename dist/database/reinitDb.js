import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { sequelize } from '../models/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function reinitializeDatabase() {
    try {
        // Disable foreign key checks temporarily
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        // Drop existing tables
        console.log('Dropping existing tables...');
        await sequelize.query('DROP TABLE IF EXISTS product_collections;');
        await sequelize.query('DROP TABLE IF EXISTS collections;');
        await sequelize.query('DROP TABLE IF EXISTS products;'); // Drop this first
        await sequelize.query('DROP TABLE IF EXISTS spaces;');
        await sequelize.query('DROP TABLE IF EXISTS users;');
        await sequelize.query('DROP TABLE IF EXISTS schema_versions;');
        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('Reading SQL migration file...');
        const sqlPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Executing SQL migration...');
        const statements = sql.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                await sequelize.query(statement + ';');
            }
        }
        console.log('Database reinitialized successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error reinitializing database:', error);
        process.exit(1);
    }
}
reinitializeDatabase();
//# sourceMappingURL=reinitDb.js.map