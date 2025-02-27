import { QueryTypes, Sequelize } from 'sequelize';

import config from '../config/environment.js';
import { initCollectionModel } from './Collection.js';
import { initProductModel } from './Product.js';
import { initSpaceModel } from './Space.js';
import { initUserModel } from './User.js';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: config.database.host,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    multipleStatements: true
  }
});

// Initialize models
export const User = initUserModel(sequelize);
export const Space = initSpaceModel(sequelize);
export const Product = initProductModel(sequelize);
export const Collection = initCollectionModel(sequelize);

// Set up associations
User.hasMany(Space, { foreignKey: 'owner_id' });
Space.belongsTo(User, { foreignKey: 'owner_id' });
Product.belongsTo(User, { foreignKey: 'owner_id' });
Product.belongsTo(Space, { foreignKey: 'space_id' });
// Collection associations
User.hasMany(Collection, { foreignKey: 'owner_id' });
Collection.belongsTo(User, { foreignKey: 'owner_id' });

// Many-to-Many relationship between Products and Collections
Product.belongsToMany(Collection, {
  through: 'product_collections',
  foreignKey: 'product_id',
  otherKey: 'collection_id'
});
Collection.belongsToMany(Product, {
  through: 'product_collections',
  foreignKey: 'collection_id',
  otherKey: 'product_id'
});

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
};

// Export sequelize instance
export { sequelize, syncDatabase, QueryTypes };
