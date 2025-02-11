import { Sequelize } from 'sequelize';
import config from '../config/environment.js';
export const sequelize = new Sequelize(config.database.name, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    define: {
        timestamps: true,
        underscored: true
    }
});
//# sourceMappingURL=connection.js.map