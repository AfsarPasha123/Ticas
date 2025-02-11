# Ticas Project

## Environment Configuration

This project uses environment-specific configuration files.

### Setup Instructions

1. Copy the appropriate `.env.example` file to `.env`
   ```bash
   # For development
   cp .env.development.example .env.development

   # For production
   cp .env.production.example .env.production

   # For testing
   cp .env.test.example .env.test
   ```

2. Fill in the copied `.env` file with your actual configuration values.

### Important Security Notes

- Never commit actual credential files to the repository
- Use strong, unique secrets for each environment
- Rotate credentials regularly
- Use environment variable injection in production

### Environment Variables

- `DB_HOST`: Database server hostname
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `PORT`: Server port
- `NODE_ENV`: Application environment (development/production/test)
- `JWT_SECRET`: Secret key for JWT token generation
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_BUCKET_NAME`: S3 bucket name

## Running the Application

```bash
# Install dependencies
npm install

# Run in development
npm run start:dev

# Build for production
npm run build

# Run tests
npm test
```
