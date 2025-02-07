import { sequelize } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function reinitializeDatabase() {
    try {
        // Drop existing tables
        console.log('Dropping existing tables...');
        await sequelize.query('DROP TABLE IF EXISTS spaces;');
        await sequelize.query('DROP TABLE IF EXISTS users;');
        await sequelize.query('DROP TABLE IF EXISTS schema_versions;');
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