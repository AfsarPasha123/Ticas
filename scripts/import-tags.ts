import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Initialize environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create a database connection
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'space_management',
  logging: console.log
});

// Import Tag model
import { DataTypes, Model } from 'sequelize';

interface TagAttributes {
  id?: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface TagModel extends Model<TagAttributes>, TagAttributes {}

const Tag = sequelize.define<TagModel>(
  'Tag',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'tags',
    timestamps: false
  }
);

async function importTags() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    console.log('Starting tag import process...');
    
    // Read the categories JSON file
    const categoriesPath = path.join(__dirname, 'categories.json');
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    
    // Extract all tags from all categories
    const allTags = new Set<string>();
    
    categoriesData.categories.forEach((category: { name: string; tags: string[] }) => {
      category.tags.forEach(tag => {
        // Convert to lowercase and trim to ensure consistency
        allTags.add(tag.toLowerCase().trim());
      });
    });
    
    console.log(`Found ${allTags.size} unique tags to import`);
    
    // Import tags in batches to avoid overwhelming the database
    const batchSize = 50;
    const tagArray = Array.from(allTags);
    const batches = Math.ceil(tagArray.length / batchSize);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < batches; i++) {
      const batchTags = tagArray.slice(i * batchSize, (i + 1) * batchSize);
      console.log(`Processing batch ${i + 1}/${batches} (${batchTags.length} tags)`);
      
      // Use Promise.all to process tags in parallel
      const results = await Promise.all(
        batchTags.map(async (tagName) => {
          try {
            // Use findOrCreate to avoid duplicates
            const [tag, created] = await Tag.findOrCreate({
              where: { name: tagName },
            });
            
            return { tagName, created };
          } catch (error) {
            console.error(`Error importing tag "${tagName}":`, error);
            return { tagName, error };
          }
        })
      );
      
      // Count results
      results.forEach(result => {
        if ('created' in result) {
          if (result.created) {
            importedCount++;
          } else {
            skippedCount++;
          }
        }
      });
    }
    
    console.log('Tag import completed:');
    console.log(`- ${importedCount} tags imported`);
    console.log(`- ${skippedCount} tags skipped (already existed)`);
    
  } catch (error) {
    console.error('Error during tag import:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the import function
importTags();
