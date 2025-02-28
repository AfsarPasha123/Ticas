// filepath: /home/dell/Work/Tilicho Work/tidycasa/Ticas/Ticas/generate-migration.js
import { execSync } from 'child_process';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name.');
  process.exit(1);
}

execSync(`npx sequelize-cli migration:generate --name ${migrationName}`, { stdio: 'inherit' });