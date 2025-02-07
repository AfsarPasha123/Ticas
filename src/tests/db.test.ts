import { User, Space } from '../models/index.js';
import { sequelize } from '../models/index.js';

async function testDatabaseConnection() {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Clean up any existing test data first
        const existingUser = await User.findOne({
            where: { email: 'test@example.com' }
        });
        if (existingUser) {
            // First delete associated spaces
            await Space.destroy({
                where: { owner_id: existingUser.getDataValue('user_id') }
            });
            // Then delete the user
            await existingUser.destroy();
            console.log('Cleaned up existing test data');
        }

        // Create a test user
        const testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpassword123',
            phone_number: 1234567890
        });
        console.log('Test user created:', testUser.toJSON());

        // Query the test user
        const foundUser = await User.findOne({
            where: { email: 'test@example.com' }
        });
        console.log('Found test user:', foundUser?.toJSON());

        // Create a test space
        const testSpace = await Space.create({
            space_name: 'Test Space',
            description: 'A test space',
            owner_id: testUser.getDataValue('user_id')
        });
        console.log('Test space created:', testSpace.toJSON());

        // Query the test space with its owner
        const foundUser2 = await User.findOne({
            where: { email: 'test@example.com' },
            include: [{
                model: Space,
                as: 'spaces'
            }]
        });
        console.log('Found user with spaces:', foundUser2?.toJSON());

        // Clean up test data
        await Space.destroy({
            where: { owner_id: testUser.getDataValue('user_id') }
        });
        await testUser.destroy();
        console.log('Test data cleaned up successfully');

    } catch (error) {
        console.error('Error testing database:', error);
    } finally {
        // Close the connection
        await sequelize.close();
    }
}

// Run the test
testDatabaseConnection();
