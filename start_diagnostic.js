import 'dotenv/config';
import { Sequelize } from 'sequelize';
import express from 'express';

async function diagnosticStart() {
  console.log('🔍 Starting Diagnostic Checks');
  
  // Database Configuration Check
  console.log('\n1. Database Configuration:');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);

  // Sequelize Connection Test
  console.log('\n2. Database Connection Test:');
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return;
  }

  // Express Server Setup
  console.log('\n3. Express Server Configuration:');
  const app = express();
  const port = process.env.PORT || 3000;

  // Basic route
  app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
  });

  // Start server
  try {
    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${port}`);
      console.log('Listening on all network interfaces');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
  }
}

diagnosticStart().catch(console.error);
