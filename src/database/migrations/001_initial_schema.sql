-- Migration: 001_initial_schema
-- Description: Initial database schema setup

-- Create schema_versions table to track migrations
CREATE TABLE IF NOT EXISTS schema_versions (
    version INT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number BIGINT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spaces table
CREATE TABLE IF NOT EXISTS spaces (
    space_id INT PRIMARY KEY AUTO_INCREMENT,
    space_name VARCHAR(255) NOT NULL,
    description TEXT,
    space_image VARCHAR(255),
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    primary_image_url TEXT,
    secondary_image_url JSON,
    price DECIMAL(10, 2),
    owner_id INT NOT NULL,
    space_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
    collection_ids JSON,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Record this migration
INSERT INTO schema_versions (version, description) VALUES (1, 'Initial schema setup');
