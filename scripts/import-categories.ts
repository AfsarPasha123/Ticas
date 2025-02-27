import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Tag, Category, CategoryTag, sequelize } from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importCategories() {
  try {
    console.log('Starting category import process...');
    
    // Read the categories JSON file
    const categoriesPath = path.join(__dirname, 'categories.json');
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    
    // Track statistics
    let categoriesImported = 0;
    let categoriesSkipped = 0;
    let tagsImported = 0;
    let tagsSkipped = 0;
    let associationsCreated = 0;
    
    // Process each category
    for (const categoryData of categoriesData.categories) {
      const categoryName = categoryData.name.trim();
      const tags = categoryData.tags.map(tag => tag.toLowerCase().trim());
      
      console.log(`Processing category "${categoryName}" with ${tags.length} tags`);
      
      // Create or find the category
      const [category, categoryCreated] = await Category.findOrCreate({
        where: { category_name: categoryName }
      });
      
      if (categoryCreated) {
        categoriesImported++;
        console.log(`Created new category: ${categoryName}`);
      } else {
        categoriesSkipped++;
        console.log(`Category already exists: ${categoryName}`);
      }
      
      // Process each tag in the category
      for (const tagName of tags) {
        // Create or find the tag
        const [tag, tagCreated] = await Tag.findOrCreate({
          where: { name: tagName }
        });
        
        if (tagCreated) {
          tagsImported++;
        } else {
          tagsSkipped++;
        }
        
        // Create the association between category and tag
        try {
          await CategoryTag.findOrCreate({
            where: {
              category_id: category.category_id,
              tag_id: tag.id
            }
          });
          associationsCreated++;
        } catch (error) {
          console.error(`Error creating association between category "${categoryName}" and tag "${tagName}":`, error);
        }
      }
    }
    
    console.log('\nCategory import completed:');
    console.log(`- ${categoriesImported} categories imported`);
    console.log(`- ${categoriesSkipped} categories skipped (already existed)`);
    console.log(`- ${tagsImported} tags imported`);
    console.log(`- ${tagsSkipped} tags skipped (already existed)`);
    console.log(`- ${associationsCreated} category-tag associations created`);
    
  } catch (error) {
    console.error('Error during category import:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the import function
importCategories();
