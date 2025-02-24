-- Add profile_image column to users table
ALTER TABLE users
ADD COLUMN profile_image VARCHAR(1024);

-- Migration Down
-- ALTER TABLE users DROP COLUMN profile_image;