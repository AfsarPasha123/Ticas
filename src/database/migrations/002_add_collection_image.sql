-- Add collection_image column to collections table
ALTER TABLE collections
ADD COLUMN collection_image VARCHAR(1024);

-- Migration Down
-- ALTER TABLE collections DROP COLUMN collection_image;
