#!/bin/bash

# Strict mode: exit on any error
set -euo pipefail

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Trap errors
trap 'log "Error on line $LINENO. Deployment failed."' ERR

# Start deployment log
log "Starting Ticas API Deployment"

# Navigate to project directory
cd /home/ubuntu/Ticas

# 1. Backup existing environment
log "Backing up existing environment"
mkdir -p ./backups
cp -n .env* ./backups/ 2>/dev/null || true

# 2. Ensure correct environment file
log "Verifying environment configuration"
if [ ! -f .env.production ]; then
    log "ERROR: .env.production file is missing!"
    exit 1
fi

# 3. Clear previous build
log "Clearing previous build"
rm -rf node_modules
rm -rf dist

# 4. Install dependencies
log "Installing project dependencies"
npm cache clean --force
npm install

# 5. Build the project
log "Building TypeScript project"
npm run build

# 6. Verify build output
log "Verifying build output"
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    log "ERROR: Build failed. Dist directory is empty!"
    exit 1
fi

# 7. Check critical files
log "Checking critical files"
files_to_check=(
    "dist/app.js"
    "dist/routes/collectionRoutes.js"
    ".env.production"
)

for file in "${files_to_check[@]}"; do
    if [ ! -f "$file" ]; then
        log "ERROR: Required file $file is missing!"
        exit 1
    fi
done

# 8. Dependency verification
log "Verifying critical dependencies"
npm list dotenv express sequelize || {
    log "ERROR: Critical dependencies are missing!"
    exit 1
}

# 9. Environment variable check
log "Checking environment variables"
required_env_vars=(
    "DB_HOST"
    "DB_USER"
    "DB_PASSWORD"
    "DB_NAME"
    "JWT_SECRET"
)

for var in "${required_env_vars[@]}"; do
    if ! grep -q "^$var=" .env.production; then
        log "WARNING: $var is not set in .env.production"
    fi
done

# 10. Start the application with detailed logging
log "Starting application"
export NODE_ENV=production
npm start &

# 11. Wait and check if the process is running
sleep 5
if ! pgrep -f "node dist/app.js" > /dev/null; then
    log "ERROR: Application failed to start!"
    exit 1
fi

log "Deployment completed successfully!"
exit 0
