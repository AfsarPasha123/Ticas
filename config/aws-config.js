const AWS = require('aws-sdk');

// AWS SDK will automatically use the IAM role credentials when deployed to EC2
// and use local credentials (~/.aws/credentials) during local development
const configureAWS = () => {
  AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
  
  // The SDK will automatically handle credentials from either:
  // 1. IAM Role (when on EC2)
  // 2. ~/.aws/credentials (local development)
  // No need to explicitly set credentials
};

module.exports = configureAWS;
