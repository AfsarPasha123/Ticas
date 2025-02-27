-- Migration: 005_add_tags
-- Description: Add tags and product_tags tables

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create product_tags junction table
CREATE TABLE IF NOT EXISTS product_tags (
    product_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add index for faster tag lookups
CREATE INDEX idx_tag_name ON tags(tag_name);

-- Insert some common tags to start with
INSERT INTO tags (tag_name) VALUES 
('fashion'),
('electronics'),
('home'),
('kitchen'),
('office'),
('sports'),
('outdoor'),
('wearable'),
('party-wear'),
('casual'),
('formal'),
('seasonal'),
('luxury'),
('budget'),
('vintage'),
('modern');

-- Record this migration
INSERT INTO schema_versions (version, description) VALUES (5, 'Add tags and product_tags tables');
