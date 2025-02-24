import fs from 'fs/promises';
import path from 'path';
import { sequelize } from './connection';
async function runMigrations() {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
        for (const file of sqlFiles) {
            const filePath = path.join(migrationsDir, file);
            const sql = await fs.readFile(filePath, 'utf8');
            await sequelize.query(sql);
            console.log(`Applied migration: ${file}`);
        }
        console.log('All migrations applied successfully');
    }
    catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}
runMigrations();
//# sourceMappingURL=runMigrations.js.map