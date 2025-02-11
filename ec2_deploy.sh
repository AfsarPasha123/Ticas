#!/bin/bash

# Exit on first error
set -e

# Print commands for debugging
set -x

# Navigate to project directory
cd /home/ubuntu/Ticas

# Install dependencies
npm install

# Clear existing dist directory
rm -rf dist

# Rebuild the project
npm run build

# List the contents of dist to verify
find dist -type f

# Verify dotenv installation
npm list dotenv

# Print out the contents of app.js to check imports
cat dist/app.js

# Run the application
npm start
