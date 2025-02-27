-- Migration: 002_add_donation_status
-- Description: Add optional donation_status column to products table

-- Alter products table to add optional donation_status column
ALTER TABLE products 
ADD COLUMN donation_status ENUM('not_donated', 'in_donation', 'donated') NULL;

-- Update existing records to have a default status
UPDATE products SET donation_status = 'not_donated' WHERE donation_status IS NULL;

-- Record this migration
INSERT INTO schema_versions (version, description) VALUES (2, 'Add optional donation status to products');
