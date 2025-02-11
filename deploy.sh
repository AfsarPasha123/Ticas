#!/bin/bash

# Exit on first error
set -e

# Print commands for debugging
set -x

# Ensure we're in the right directory
cd /home/ubuntu/Ticas

# Clear existing dist directory
rm -rf dist

# Rebuild the project
npm run build

# List the contents of the dist directory to verify
find dist -type f

# Print out the contents of app.js to check imports
cat dist/app.js

# Verify module resolution
node --experimental-specifier-resolution=node dist/app.js

# If all checks pass, start the server
npm start
